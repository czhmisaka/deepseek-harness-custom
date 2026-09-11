/**
 * Computer use for DeepSeek Harness: the model-facing `computer` tool that
 * captures the screen and drives the mouse and keyboard of the local macOS
 * session. One action-union tool follows the computer-use convention; the
 * plugin is opt-in per profile (a patch row must list the enabled actions),
 * and the tool registers only while a durable attachment store is mounted so
 * screenshots can ride later model requests.
 *
 * Coordinates arrive in the LATEST screenshot's attached-image pixels and are
 * converted to screen points against that capture's mapping, so the model
 * never performs scaling arithmetic itself. Pointing actions before the first
 * screenshot fail on purpose: a computer-use agent must look before it acts.
 * @module dsh-tool-computer-use
 */

import { chmod, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import z from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { createMacBackend, PermissionDeniedError } from './macos.js'
import {
  ACTIONS, effectiveActions, imageToPoints, parseKeySpec, pointToImage,
  resolveDisplaySetting, validateActionList,
} from './key-script.js'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'tool-computer-use'

/** Services required at activation; the attachment store gates the tool itself. */
export const inject = ['tools']

/**
 * Plugin configuration. `allowedActions` is deliberately required: mounting
 * the plugin must be a conscious act, and the deployment narrows the surface
 * (for example dropping `type` to forbid typing arbitrary text).
 */
export const Config = z.object({
  allowedActions: z.array(z.string()).required(),
})

/** Settings namespace owning the user-facing controls, persisted in settings.yaml. */
export const SETTINGS_NAMESPACE = 'computer-use'

/**
 * User settings section the settings page toggles: the master switch, the
 * per-action user denials (absent or `true` = allowed; `false` = denied), and
 * which display the model may capture and control (`'main'` or a 1-based
 * display index as a string).
 */
export const SettingsSchema = z.object({
  enabled: z.boolean().default(true),
  actions: z.dict(z.boolean()).default({}),
  display: z.string().default('main'),
})

/** Action groups the settings page renders, in display order. */
export const ACTION_GROUPS = [
  { key: 'observe', label: '观察', actions: ['screenshot', 'cursor_position'] },
  { key: 'mouse', label: '鼠标', actions: ['left_click', 'double_click', 'right_click', 'move', 'drag'] },
  { key: 'keyboard', label: '键盘', actions: ['type', 'key', 'scroll'] },
  { key: 'other', label: '其他', actions: ['wait'] },
]

/** Read-only actions the 只读观察 preset keeps enabled. */
const READONLY_ACTIONS = ['screenshot', 'cursor_position']

/**
 * Build the settings schema the settings page consumes. The schema carries a
 * `computerUi` metadata bag (extra) with everything the custom panel needs
 * beyond the persisted values: the deployment allowlist, the live display
 * list, and the environment permission probes. The lists fill in shortly
 * after registration by mutating this bag in place — every settings describe
 * re-serializes the schema, so the next read picks the data up.
 * @param {string[]} allowedActions - the deployment Config allowlist.
 * @returns {object} the registered schema node (keep the reference to mutate its meta).
 */
function buildSettingsSchema(allowedActions) {
  const schema = z.object({
    enabled: z.boolean().default(true),
    actions: z.dict(z.boolean()).default({}),
    display: z.string().default('main'),
  }).extra('computerUi', {
    allowedActions,
    displays: [],
    environment: null,
  })
  return schema
}

/** Hard cap on the `wait` action; the tool timeoutMs must stay above it. */
const MAX_WAIT_MS = 60_000

/** Hard cap on scroll arrow presses. */
const MAX_SCROLL_AMOUNT = 40

/** Output schema of the screenshot image reference, mirroring `read_image`. */
const IMAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    attachmentId: { type: 'string', required: true },
    mediaType: { type: 'string', enum: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'], required: true },
    bytes: { type: 'integer', required: true },
    width: { type: 'integer', required: true },
    height: { type: 'integer', required: true },
    name: { type: 'string' },
    originalDimensions: {
      type: 'object',
      additionalProperties: false,
      properties: {
        width: { type: 'integer', required: true },
        height: { type: 'integer', required: true },
      },
    },
  },
}

const TOOL_DESCRIPTION =
  'Control the local macOS computer: capture the screen, and move, click, drag, type, and press keys on the real machine. '
  + 'Every action executes immediately — there is no dry-run. Workflow: take a screenshot first and after every UI change; '
  + 'express every coordinate in the LATEST screenshot\'s attached-image pixels (the tool converts them to screen points for you). '
  + 'Screenshots capture the display chosen in the plugin settings (default: the main display); coordinates always map within the captured display. '
  + 'Screenshots require the current model to accept image input. Scrolling is keyboard-based (arrow keys). '
  + 'double_click, right_click, move, and drag additionally need the cliclick binary ("brew install cliclick"). '
  + 'Requires macOS Screen Recording and Accessibility permissions for the app that runs the harness.'

const PARAMETERS = {
  action: {
    type: 'string',
    enum: ACTIONS,
    required: true,
    description: 'The computer action to perform. Screenshot and cursor_position are read-only; the rest control the real machine.',
  },
  coordinate: {
    type: 'array',
    items: { type: 'integer' },
    description: 'Integer [x, y] in the LATEST screenshot\'s attached-image pixels. Required for left_click, double_click, '
      + 'right_click, and move; for drag this is the release point. Take a screenshot first.',
  },
  start_coordinate: {
    type: 'array',
    items: { type: 'integer' },
    description: 'Drag start [x, y] in the same pixel space as coordinate. Required for drag.',
  },
  text: {
    type: 'string',
    description: 'Text to type into the focused application (action "type"). Newlines become Return presses, tabs become Tab presses.',
  },
  key: {
    type: 'string',
    description: 'Key or key combo to press (action "key"): "Return", "cmd+c", "ctrl+shift+T", "alt+F4". Named keys: Return, Tab, '
      + 'Escape, Delete, ForwardDelete, Space, Up, Down, Left, Right, PageUp, PageDown, Home, End, F1-F12; or a single character.',
  },
  direction: {
    type: 'string',
    enum: ['up', 'down', 'left', 'right'],
    description: 'Scroll direction (action "scroll").',
  },
  amount: {
    type: 'integer',
    description: 'How many arrow-key presses to send for scroll (default 3, max ' + MAX_SCROLL_AMOUNT + ').',
  },
  durationMs: {
    type: 'integer',
    description: 'Milliseconds to wait (action "wait", 1-' + MAX_WAIT_MS + ').',
  },
}

/** Output schema: one object union discriminated by `kind`; render falls through on unknown kinds. */
const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: {
      type: 'string',
      enum: ['screenshot', 'cursor_position', 'clicked', 'moved', 'dragged', 'typed', 'key_pressed', 'scrolled', 'waited'],
      required: true,
    },
    path: { type: 'string' },
    screen: {
      type: 'object',
      additionalProperties: false,
      properties: {
        width: { type: 'integer', required: true },
        height: { type: 'integer', required: true },
      },
    },
    displayCount: { type: 'integer' },
    displayIndex: { type: 'integer' },
    displayIsMain: { type: 'boolean' },
    image: IMAGE_SCHEMA,
    point: { type: 'array', items: { type: 'integer' } },
    coordinate: { type: 'array', items: { type: 'integer' } },
    start: { type: 'array', items: { type: 'integer' } },
    action: { type: 'string' },
    characters: { type: 'integer' },
    key: { type: 'string' },
    direction: { type: 'string' },
    amount: { type: 'integer' },
    durationMs: { type: 'integer' },
  },
}

/**
 * Enforce a hand-checked cross-field rule the schema DSL cannot express: the
 * action must be enabled and every field it needs must be a two-integer
 * coordinate pair.
 * @param {object} args - schema-validated tool arguments.
 * @param {string[]} allowedActions - the Config allowlist.
 * @returns {{action: string}} the validated action name.
 */
/**
 * Enforce the two permission layers on one action: the deployment allowlist
 * decides what is EVER available, and the user settings may deny an action
 * the deployment granted. The two denials produce distinct, actionable
 * errors.
 * @param {object} args - schema-validated tool arguments.
 * @param {string[]} allowedActions - the Config allowlist.
 * @param {Record<string, boolean>} userActions - the settings `actions` section.
 * @returns {{action: string}} the validated action name.
 */
function assertActionAllowed(args, allowedActions, userActions) {
  if (!allowedActions.includes(args.action)) {
    throw new Error('action "' + args.action + '" is not enabled for this deployment; allowed actions: ' + allowedActions.join(', '))
  }
  if (userActions[args.action] === false) {
    throw new Error('action "' + args.action + '" is turned off in the computer-use settings; '
      + 'the user can re-enable it in 设置 → Computer 使用')
  }
  return { action: args.action }
}

/**
 * Require a two-integer coordinate argument.
 * @param {unknown} value - the raw argument.
 * @param {string} name - argument name for the error message.
 * @param {string} action - action name for the error message.
 * @returns {number[]} the validated pair.
 */
function requirePair(value, name, action) {
  if (!Array.isArray(value) || value.length !== 2 || !Number.isInteger(value[0]) || !Number.isInteger(value[1])) {
    throw new Error(action + ' requires ' + name + ' as a two-integer [x, y] pair in the latest screenshot\'s pixels')
  }
  return value
}

/**
 * Abort-aware sleep for the wait action.
 * @param {number} ms - duration.
 * @param {AbortSignal|undefined} signal - tool execution signal.
 * @returns {Promise<void>} resolves after ms, rejects on abort.
 */
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('wait aborted before it started'))
      return
    }
    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)
    const onAbort = () => {
      cleanup()
      reject(new Error('wait aborted after ' + ms + ' ms'))
    }
    function cleanup() {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Refuse a screenshot when the calling route cannot see images, mirroring the
 * read_image tool: an invisible screenshot makes computer use blind, so an
 * unknown or image-incapable route refuses instead of returning pixels the
 * model can never inspect.
 * @param {object} ctx - plugin context for the optional llm service.
 * @param {object} exec - tool execution context.
 */
async function assertImageCapableRoute(ctx, exec) {
  const routed = exec.agent?.session.requestHeader?.()?.config
  const provider = routed?.provider ?? exec.agent?.options.provider
  const model = routed?.model ?? exec.agent?.options.model
  const llm = ctx.get('llm')
  if (provider === undefined || model === undefined || llm === undefined) {
    throw new Error('cannot screenshot: the current model route could not be resolved')
  }
  const active = await llm.resolveModelInfo(provider, model, exec.signal)
  if (active?.inputModalities === undefined || !active.inputModalities.includes('image')) {
    throw new Error('cannot screenshot: model "' + model + '" does not declare image input; computer use needs a model that can see the screen')
  }
}

/**
 * Build the model-facing text envelope for a screenshot result.
 * @param {object} value - the canonical screenshot value.
 * @returns {string} the envelope text.
 */
function formatScreenshotText(value) {
  const image = value.image
  let captured = ''
  if (image.originalDimensions !== undefined) {
    captured = ', captured at ' + image.originalDimensions.width + 'x' + image.originalDimensions.height + ' px'
  }
  let display = ''
  if (value.displayCount > 1) {
    display = '\nThis is display ' + value.displayIndex + ' of ' + value.displayCount
      + (value.displayIsMain ? ' (the main display)' : '') + '; other displays were not captured.'
  }
  return '<screen>' + value.screen.width + 'x' + value.screen.height + ' points</screen>\n'
    + '<image>' + image.mediaType + ', ' + image.width + 'x' + image.height + ' px attached' + captured + '</image>\n'
    + 'Express every later coordinate in THIS attached image\'s pixels; the tool converts them to screen points automatically. '
    + 'Full-size capture saved at ' + value.path + '.' + display
}

/**
 * Build the one-line model-facing text for a non-screenshot result.
 * @param {object} value - the canonical result value.
 * @returns {string} the summary line.
 */
function formatActionText(value) {
  const at = (pair) => '(' + pair[0] + ', ' + pair[1] + ')'
  switch (value.kind) {
    case 'cursor_position': {
      const image = value.coordinate === undefined ? '' : ' = ' + at(value.coordinate) + ' in latest screenshot pixels'
      return 'cursor at ' + at(value.point) + ' points' + image
    }
    case 'clicked':
      return value.action + ' at screen point ' + at(value.point) + ' sent'
    case 'moved':
      return 'pointer moved to screen point ' + at(value.point)
    case 'dragged':
      return 'drag from ' + at(value.start) + ' to ' + at(value.point) + ' sent'
    case 'typed':
      return 'typed ' + value.characters + ' characters into the focused application'
    case 'key_pressed':
      return 'key "' + value.key + '" sent'
    case 'scrolled':
      return 'scrolled ' + value.direction + ' by ' + value.amount + ' keyboard presses'
    case 'waited':
      return 'waited ' + value.durationMs + ' ms'
    default:
      // Merge-extensible union: an unknown future kind degrades to its JSON form.
      return 'computer action completed: ' + JSON.stringify(value)
  }
}

/**
 * Pure pending-state presenter: a generic card naming the action.
 * @param {object} args - validated tool arguments.
 * @returns {object} the generic call view.
 */
function presentCall(args) {
  const action = typeof args?.action === 'string' ? args.action : 'computer'
  let title = 'computer · ' + action
  if ((action === 'left_click' || action === 'double_click' || action === 'right_click' || action === 'move')
    && Array.isArray(args.coordinate)) {
    title = 'computer · ' + action + ' ' + args.coordinate[0] + ',' + args.coordinate[1]
  } else if (action === 'key' && typeof args.key === 'string') {
    title = 'computer · key ' + args.key
  } else if (action === 'scroll' && typeof args.direction === 'string') {
    title = 'computer · scroll ' + args.direction
  } else if (action === 'wait' && Number.isInteger(args.durationMs)) {
    title = 'computer · wait ' + args.durationMs + 'ms'
  }
  return { card: 'generic', title }
}

/**
 * Register the `computer` tool. Runs inside the attachments injection, so the
 * tool exists only while a durable image store is mounted; execution keeps a
 * defensive re-check for direct callers.
 * @param {object} ctx - the scoped context (tools + attachments services).
 * @param {object} backend - the macOS backend from createMacBackend.
 * @param {string[]} allowedActions - the Config allowlist.
 * @param {() => {enabled: boolean, actions: Record<string, boolean>, display: string}} readState - live
 *   reader over the user settings section.
 */
function registerComputerTool(ctx, backend, allowedActions, readState) {
  /** The latest capture's attached dimensions, the display's points, and its global origin. */
  let lastCapture = null
  let captureCounter = 0

  ctx.tools.register(defineTool({
    name: 'computer',
    description: TOOL_DESCRIPTION,
    parameters: PARAMETERS,
    output: {
      schema: OUTPUT_SCHEMA,
      render: (_args, value) => {
        if (value.kind === 'screenshot') {
          const attachment = { ...value.image }
          return [
            { type: 'text', text: formatScreenshotText(value) },
            { type: 'image', attachment },
          ]
        }
        return [{ type: 'text', text: formatActionText(value) }]
      },
    },
    timeoutMs: MAX_WAIT_MS + 5_000,
    // Mouse and keyboard order matters, and the screenshot mapping must stay
    // consistent with what the model last saw — never join a parallel group.
    isConcurrencySafe: () => false,
    presentCall,
    async execute(args, exec) {
      const state = readState()
      if (state.enabled === false) {
        throw new Error('computer use is currently disabled — re-enable it in 设置 → Computer 使用')
      }
      assertActionAllowed(args, allowedActions, state.actions)

      switch (args.action) {
        case 'screenshot': {
          const attachments = ctx.get('attachments')
          if (attachments === undefined) {
            throw new Error('cannot screenshot: no attachment service is mounted')
          }
          await assertImageCapableRoute(ctx, exec)

          // Resolve the configured display against the live list: the main
          // display keeps the legacy full-display capture; any other display
          // region-captures its exact rectangle in global coordinates.
          const displays = await backend.listDisplays(exec.signal)
          const target = resolveDisplaySetting(state.display, displays)
          const isMain = target.isMain === true
          const bounds = isMain ? undefined : { x: target.x, y: target.y, width: target.width, height: target.height }
          const screen = isMain
            ? await backend.screenBounds(exec.signal)
            : { width: target.width, height: target.height }

          const stamp = new Date().toISOString().replace(/[:.]/gu, '-')
          const byteCap = Math.min(attachments.imageLimits.maxImageBytes, attachments.imageLimits.maxMessageImageBytes)

          // PNG first for lossless text; fall back to JPEG when the byte cap
          // rejects the PNG (large retina displays), then refuse honestly.
          let mediaType = 'image/png'
          let capturePath = join(tmpdir(), 'dsh-computer-use-' + stamp + '-' + (captureCounter++) + '.png')
          await backend.captureScreen(capturePath, 'png', isMain ? undefined : bounds, exec.signal)
          let data = await readFile(capturePath)
          if (data.byteLength > byteCap) {
            mediaType = 'image/jpeg'
            capturePath = join(tmpdir(), 'dsh-computer-use-' + stamp + '-' + (captureCounter++) + '.jpg')
            await backend.captureScreen(capturePath, 'jpg', isMain ? undefined : bounds, exec.signal)
            data = await readFile(capturePath)
            if (data.byteLength > byteCap) {
              throw new Error('the screenshot exceeds the attachment byte cap (' + byteCap + ' bytes) even as JPEG; '
                + 'reduce the display resolution or raise the deployment\'s image byte limits')
            }
          }
          // The capture contains the user's screen — keep it private to the owner.
          await chmod(capturePath, 0o600)

          let ref
          try {
            ref = await attachments.saveImage({
              data,
              mediaType,
              name: 'screenshot-' + stamp + (mediaType === 'image/png' ? '.png' : '.jpg'),
            })
          } catch (error) {
            throw new Error('the screenshot could not be stored: ' + (error?.message ?? String(error)), { cause: error })
          }

          // The model sees the ATTACHED image (possibly downscaled), so the
          // mapping runs attached pixels against the captured display's
          // points, offset by the display's global origin.
          lastCapture = {
            attachedWidth: ref.width,
            attachedHeight: ref.height,
            screenWidth: screen.width,
            screenHeight: screen.height,
            originX: isMain ? 0 : target.x,
            originY: isMain ? 0 : target.y,
          }
          return {
            kind: 'screenshot',
            path: capturePath,
            screen: { width: screen.width, height: screen.height },
            displayCount: displays.length,
            displayIndex: target.index,
            displayIsMain: isMain,
            image: {
              attachmentId: ref.attachmentId,
              mediaType: ref.mediaType,
              bytes: ref.bytes,
              width: ref.width,
              height: ref.height,
              ...(ref.name === undefined ? {} : { name: ref.name }),
              ...(ref.originalDimensions === undefined ? {} : {
                originalDimensions: { ...ref.originalDimensions },
              }),
            },
          }
        }

        case 'cursor_position': {
          const point = await backend.cursorPosition(exec.signal)
          const value = { kind: 'cursor_position', point: [point.x, point.y] }
          if (lastCapture !== null) {
            const image = pointToImage(point.x, point.y, lastCapture)
            // Only translate when the cursor is actually on the captured
            // display; a point on another display has no pixel in this image.
            if (image.inside) {
              value.coordinate = [image.x, image.y]
            }
          }
          return value
        }

        case 'left_click':
        case 'double_click':
        case 'right_click':
        case 'move': {
          if (lastCapture === null) throw new Error('no screenshot yet: take a screenshot first; coordinates are expressed in its pixels')
          const pair = requirePair(args.coordinate, 'coordinate', args.action)
          const target = imageToPoints(pair[0], pair[1], lastCapture)
          if (args.action === 'move') await backend.move(target.x, target.y, exec.signal)
          else if (args.action === 'double_click') await backend.doubleClick(target.x, target.y, exec.signal)
          else if (args.action === 'right_click') await backend.rightClick(target.x, target.y, exec.signal)
          else await backend.leftClick(target.x, target.y, exec.signal)
          return { kind: args.action === 'move' ? 'moved' : 'clicked', action: args.action, point: [target.x, target.y] }
        }

        case 'drag': {
          if (lastCapture === null) throw new Error('no screenshot yet: take a screenshot first; coordinates are expressed in its pixels')
          const startPair = requirePair(args.start_coordinate, 'start_coordinate', 'drag')
          const endPair = requirePair(args.coordinate, 'coordinate', 'drag')
          const start = imageToPoints(startPair[0], startPair[1], lastCapture)
          const end = imageToPoints(endPair[0], endPair[1], lastCapture)
          await backend.drag(start, end, exec.signal)
          return { kind: 'dragged', start: [start.x, start.y], point: [end.x, end.y] }
        }

        case 'type': {
          if (typeof args.text !== 'string' || args.text.length === 0) {
            throw new Error('type requires non-empty text')
          }
          await backend.typeText(args.text, exec.signal)
          return { kind: 'typed', characters: args.text.length }
        }

        case 'key': {
          if (typeof args.key !== 'string' || args.key.trim().length === 0) {
            throw new Error('key requires a key name such as "Return" or a combo such as "cmd+c"')
          }
          const spec = parseKeySpec(args.key)
          await backend.pressKey(spec, exec.signal)
          return { kind: 'key_pressed', key: args.key }
        }

        case 'scroll': {
          if (args.direction === undefined) throw new Error('scroll requires a direction (up, down, left, right)')
          const amount = args.amount ?? 3
          if (!Number.isInteger(amount) || amount < 1 || amount > MAX_SCROLL_AMOUNT) {
            throw new Error('scroll amount must be an integer between 1 and ' + MAX_SCROLL_AMOUNT)
          }
          await backend.scroll(args.direction, amount, exec.signal)
          return { kind: 'scrolled', direction: args.direction, amount }
        }

        case 'wait': {
          if (!Number.isInteger(args.durationMs) || args.durationMs < 1 || args.durationMs > MAX_WAIT_MS) {
            throw new Error('wait durationMs must be an integer between 1 and ' + MAX_WAIT_MS)
          }
          await sleep(args.durationMs, exec.signal)
          return { kind: 'waited', durationMs: args.durationMs }
        }

        default:
          // Closed action union, re-checked against the allowlist above.
          throw new Error('unsupported action "' + String(args.action) + '"')
      }
    },
  }))
}

/**
 * Normalize one settings section into the state the tool execute path reads:
 * booleans stay forgiving (a malformed section degrades to defaults instead
 * of wedging the tool), while the display value is validated at capture time
 * against the live list.
 * @param {object|undefined} section - the resolved settings section.
 * @returns {{enabled: boolean, actions: Record<string, boolean>, display: string}} the
 *   runtime state.
 */
function normalizeState(section) {
  const actions = {}
  if (section?.actions !== undefined && typeof section.actions === 'object' && section.actions !== null) {
    for (const [key, value] of Object.entries(section.actions)) {
      if (typeof value === 'boolean') actions[key] = value
    }
  }
  const display = typeof section?.display === 'string' && section.display.length > 0 ? section.display : 'main'
  return { enabled: section?.enabled !== false, actions, display }
}

/**
 * Plugin entry: validate configuration, fail loud off macOS, and mount the
 * tool beside the attachment store. The settings namespace carries a
 * `computerUi` metadata bag for the settings panel (deployment allowlist,
 * display list, environment probes); the display list and the probes fill in
 * asynchronously by mutating the bag in place, and every settings describe
 * re-serializes the schema, so the next page read picks them up.
 * @param {object} ctx - the Cordis plugin context.
 * @param {{allowedActions: string[]}} config - schemastery-validated plugin config.
 */
export function apply(ctx, config) {
  if (process.platform !== 'darwin') {
    throw new Error('tool-computer-use: this plugin supports macOS (darwin) only; current platform is ' + process.platform)
  }
  const allowedActions = validateActionList(config?.allowedActions)
  const backend = createMacBackend()
  // The user-facing controls live in the user-settings document (settings.yaml),
  // edited from the web settings page. The namespace registers only while a
  // settings provider is composed; without one the tool runs enabled.
  let state = { enabled: true, actions: {}, display: 'main' }
  ctx.inject(['settings'], (settingsCtx) => {
    const uiSchema = buildSettingsSchema(allowedActions)
    try {
      const scope = settingsCtx.settings.register(SETTINGS_NAMESPACE, uiSchema)
      state = normalizeState(scope.get())
      // Live controls: the settings page writes the namespace; this closure is
      // the only reader the tool execute path sees.
      scope.watch((next) => { state = normalizeState(next) })
    } catch (error) {
      // The namespace registers once per apply. A duplicate means this apply
      // raced a live registration: adopt the resolved snapshot, but the page
      // controls then need a dsh restart to take effect (no watch handle or
      // registration handle is exposed, so the meta fills below mutate a
      // node the provider will not serve until that restart).
      if (!/already registered/u.test(error?.message ?? '')) throw error
      state = normalizeState(settingsCtx.settings.get(SETTINGS_NAMESPACE))
    }
    // Fill the UI metadata asynchronously: the display list and the
    // environment permission probes. Failures leave the placeholders in
    // place; the settings page degrades instead of erroring.
    backend.listDisplays().then(
      (displays) => { uiSchema.meta.computerUi.displays = displays },
      () => { uiSchema.meta.computerUi.displays = [] },
    )
    backend.probeEnvironment().then(
      (environment) => { uiSchema.meta.computerUi.environment = environment },
      () => { uiSchema.meta.computerUi.environment = null },
    )
  })
  ctx.inject(['attachments'], (imageCtx) => {
    registerComputerTool(imageCtx, backend, allowedActions, () => state)
  })
}

// Re-exported for tests and for deployments that want the pieces.
export { ACTIONS, PermissionDeniedError, READONLY_ACTIONS, effectiveActions, resolveDisplaySetting }
