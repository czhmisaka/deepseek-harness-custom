/**
 * Pure script-building logic for the computer-use tool: the macOS key
 * vocabulary, AppleScript script builders, and the screenshot-pixel to
 * screen-point coordinate conversion. No process or filesystem I/O lives
 * here, so tests can exercise every builder and parser directly.
 * @module dsh-tool-computer-use/key-script
 */

/** Every action the `computer` tool exposes; also the Config allowlist vocabulary. */
export const ACTIONS = Object.freeze([
  'screenshot',
  'cursor_position',
  'left_click',
  'double_click',
  'right_click',
  'move',
  'drag',
  'type',
  'key',
  'scroll',
  'wait',
])

/** Actions that need a screen-point coordinate. */
export const POINT_ACTIONS = Object.freeze(['left_click', 'double_click', 'right_click', 'move'])

/**
 * macOS virtual key codes for the named-key vocabulary (from Events.h).
 * Single characters are typed with `keystroke` instead, so they are absent here.
 */
export const KEY_CODES = Object.freeze({
  return: 36,
  enter: 36,
  tab: 48,
  escape: 53,
  esc: 53,
  delete: 51,
  backspace: 51,
  forwarddelete: 117,
  space: 49,
  up: 126,
  down: 125,
  left: 123,
  right: 124,
  pageup: 116,
  pagedown: 121,
  home: 115,
  end: 119,
  f1: 122,
  f2: 120,
  f3: 99,
  f4: 118,
  f5: 96,
  f6: 97,
  f7: 98,
  f8: 100,
  f9: 101,
  f10: 109,
  f11: 103,
  f12: 111,
})

/** AppleScript modifier flag names for the accepted modifier vocabulary. */
export const MODIFIER_NAMES = Object.freeze({
  cmd: 'command down',
  command: 'command down',
  meta: 'command down',
  ctrl: 'control down',
  control: 'control down',
  alt: 'option down',
  option: 'option down',
  opt: 'option down',
  shift: 'shift down',
})

/** Arrow key codes used by the keyboard-based `scroll` action. */
export const SCROLL_KEY_CODES = Object.freeze({ up: 126, down: 125, left: 123, right: 124 })

/**
 * Escape one fragment for an AppleScript double-quoted string literal.
 * @param {string} fragment - raw text without newlines or tabs.
 * @returns {string} the escaped literal body.
 */
export function escapeAppleScriptString(fragment) {
  let out = ''
  for (const char of fragment) {
    if (char === '\\') out += '\\\\'
    else if (char === '"') out += '\\"'
    else out += char
  }
  return out
}

/**
 * Build the System Events script that types text. Newlines become Return
 * presses and tabs become Tab presses, because AppleScript string literals
 * cannot span lines and `keystroke` sends control keys only through
 * constants.
 * @param {string} text - the text to type; non-empty, no NUL characters.
 * @returns {string} a complete `osascript -e` script.
 */
export function buildKeystrokeScript(text) {
  const lines = text.split('\n').map((line) =>
    line.split('\t')
      .map((fragment) => '"' + escapeAppleScriptString(fragment) + '"')
      .join(' & tab & '),
  )
  return 'tell application "System Events"\n  keystroke (' + lines.join(' & return & ') + ')\nend tell'
}

/**
 * Parse a key specification like `cmd+c`, `ctrl+shift+Return`, or `a`.
 * Modifiers come first, separated by `+`; the last token is the target key.
 * @param {string} key - the raw `key` argument.
 * @returns {{char?: string, code?: number, modifiers: string[]}} the parsed
 *   spec: `char` for keystroke targets, `code` for named keys, and the
 *   AppleScript modifier flag names in press order.
 */
export function parseKeySpec(key) {
  const tokens = key.split('+').map((token) => token.trim()).filter((token) => token.length > 0)
  if (tokens.length === 0) throw new Error('key must name a key, for example "Return" or "cmd+c"')
  const target = tokens[tokens.length - 1]
  const modifiers = []
  for (const token of tokens.slice(0, -1)) {
    const flag = MODIFIER_NAMES[token.toLowerCase()]
    if (flag === undefined) {
      throw new Error('unknown modifier "' + token + '"; supported modifiers are cmd, ctrl, alt, shift (as in "cmd+c")')
    }
    if (modifiers.includes(flag)) {
      throw new Error('duplicate modifier "' + token + '" in key "' + key + '"')
    }
    modifiers.push(flag)
  }
  const named = KEY_CODES[target.toLowerCase()]
  if (named !== undefined) return { code: named, modifiers }
  if (target.length === 1) return { char: target, modifiers }
  throw new Error(
    'unknown key "' + target + '"; use a named key (Return, Tab, Escape, Delete, ForwardDelete, Space, '
    + 'Up, Down, Left, Right, PageUp, PageDown, Home, End, F1-F12) or a single character',
  )
}

/**
 * Build the System Events script for one parsed key spec, with optional
 * modifiers applied to both keystroke and key-code branches.
 * @param {{char?: string, code?: number, modifiers: string[]}} spec - a
 *   {@link parseKeySpec} result.
 * @returns {string} a complete `osascript -e` script.
 */
export function buildKeyScript(spec) {
  const using = spec.modifiers.length > 0 ? ' using {' + spec.modifiers.join(', ') + '}' : ''
  const statement = spec.char !== undefined
    ? 'keystroke (' + '"' + escapeAppleScriptString(spec.char) + '"' + ')'
    : 'key code ' + spec.code
  return 'tell application "System Events"\n  ' + statement + using + '\nend tell'
}

/**
 * Build the System Events script that clicks at one screen point.
 * @param {number} x - screen point x.
 * @param {number} y - screen point y.
 * @returns {string} a complete `osascript -e` script.
 */
export function buildClickScript(x, y) {
  assertInteger(x, 'x')
  assertInteger(y, 'y')
  return 'tell application "System Events"\n  click at {' + x + ', ' + y + '}\nend tell'
}

/**
 * Build the System Events script that scrolls by pressing arrow keys. macOS
 * has no scriptable scroll-wheel event without extra tooling, so scrolling is
 * keyboard-based and coarse.
 * @param {'up'|'down'|'left'|'right'} direction - scroll direction.
 * @param {number} amount - how many arrow presses to send.
 * @returns {string} a complete `osascript -e` script.
 */
export function buildScrollScript(direction, amount) {
  const code = SCROLL_KEY_CODES[direction]
  if (code === undefined) throw new Error('unknown scroll direction "' + direction + '"')
  assertInteger(amount, 'amount')
  return 'tell application "System Events"\n  repeat ' + amount + ' times\n    key code ' + code + '\n    delay 0.04\n  end repeat\nend tell'
}

/**
 * Convert one coordinate from the latest screenshot's attached-image pixels
 * to GLOBAL screen points, using the capture mapping, and clamp it onto the
 * captured display. The mapping's `originX`/`originY` place the captured
 * display in the global coordinate space (main display: 0, 0), so a capture
 * of a secondary display yields points cliclick and System Events accept
 * directly.
 * @param {number} ix - x in attached-image pixels.
 * @param {number} iy - y in attached-image pixels.
 * @param {{attachedWidth: number, attachedHeight: number, screenWidth: number, screenHeight: number,
 *   originX?: number, originY?: number}} mapping - the latest capture's attached
 *   dimensions, the captured display's dimensions in points, and its origin.
 * @returns {{x: number, y: number}} global screen points, clamped to the display.
 */
export function imageToPoints(ix, iy, mapping) {
  assertInteger(ix, 'coordinate[0]')
  assertInteger(iy, 'coordinate[1]')
  const originX = mapping.originX ?? 0
  const originY = mapping.originY ?? 0
  const x = Math.round(ix * (mapping.screenWidth / mapping.attachedWidth)) + originX
  const y = Math.round(iy * (mapping.screenHeight / mapping.attachedHeight)) + originY
  return {
    x: Math.min(Math.max(x, originX), originX + mapping.screenWidth),
    y: Math.min(Math.max(y, originY), originY + mapping.screenHeight),
  }
}

/**
 * Convert one global screen point back into the latest screenshot's
 * attached-image pixels, reporting whether the point actually lies on the
 * captured display. Points on another display report `inside: false` instead
 * of a clamped lie.
 * @param {number} x - global screen point x.
 * @param {number} y - global screen point y.
 * @param {{attachedWidth: number, attachedHeight: number, screenWidth: number, screenHeight: number,
 *   originX?: number, originY?: number}} mapping - the latest capture's mapping.
 * @returns {{x: number, y: number, inside: boolean}} attached-image pixels and
 *   whether the point was on the captured display.
 */
export function pointToImage(x, y, mapping) {
  const originX = mapping.originX ?? 0
  const originY = mapping.originY ?? 0
  const right = originX + mapping.screenWidth
  const bottom = originY + mapping.screenHeight
  const inside = x >= originX && x <= right && y >= originY && y <= bottom
  return {
    x: Math.min(Math.max(Math.round((x - originX) * (mapping.attachedWidth / mapping.screenWidth)), 0), mapping.attachedWidth),
    y: Math.min(Math.max(Math.round((y - originY) * (mapping.attachedHeight / mapping.screenHeight)), 0), mapping.attachedHeight),
    inside,
  }
}

/**
 * Resolve the `display` user setting against the live display list. `'main'`
 * (or empty) picks the main display, falling back to the first one; a numeric
 * string picks that 1-based display index. Display IDs are deliberately NOT
 * accepted: small CGDirectDisplayID values (1, 2, 3) are ambiguous against
 * indices, and the settings UI only ever stores `'main'` or an index.
 * Unknown values fail loud with the active choices so the model can tell the
 * user how to fix the setting.
 * @param {string|undefined} raw - the configured display value.
 * @param {Array<{id: number, index: number, isMain: boolean, x: number, y: number, width: number, height: number}>} displays - the
 *   active displays, as {@link listDisplays} reports them.
 * @returns {object} the matching display record.
 */
export function resolveDisplaySetting(raw, displays) {
  if (displays.length === 0) {
    throw new Error('no active display was found; connect a display and retry')
  }
  const main = displays.find((display) => display.isMain) ?? displays[0]
  if (raw === undefined || raw === null || raw === '' || raw === 'main') return main
  const byIndex = displays.find((display) => String(display.index) === String(raw))
  if (byIndex !== undefined) return byIndex
  throw new Error(
    'the configured display (' + String(raw) + ') is not present; active displays: '
      + displays.map((display) => String(display.index) + (display.isMain ? ' (main)' : '')).join(', ')
      + '. Fix it in 设置 → Computer 使用',
  )
}

/**
 * Intersect the deployment allowlist with the user's per-action denials: the
 * deployment decides what is EVER available, the user layer only narrows.
 * @param {string[]} allowedActions - the Config allowlist.
 * @param {Record<string, boolean>|undefined} userActions - the `actions` settings
 *   section; an entry equal to `false` denies that action.
 * @returns {string[]} the effective action list.
 */
export function effectiveActions(allowedActions, userActions) {
  if (!Array.isArray(allowedActions)) return []
  if (userActions === undefined || userActions === null || typeof userActions !== 'object') {
    return [...allowedActions]
  }
  return allowedActions.filter((action) => userActions[action] !== false)
}

/**
 * Validate the Config `allowedActions` list: non-empty, every entry a known
 * action, duplicates collapsed. Fails loud so a typo never silently disables
 * a capability the deployment believes it granted.
 * @param {unknown} raw - the configured list.
 * @returns {string[]} the validated, deduplicated action list.
 */
export function validateActionList(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('tool-computer-use: allowedActions must be a non-empty array of action names')
  }
  const allowed = []
  for (const entry of raw) {
    if (typeof entry !== 'string' || !ACTIONS.includes(entry)) {
      throw new Error('tool-computer-use: unknown action ' + JSON.stringify(entry ?? null) + '; allowed actions: ' + ACTIONS.join(', '))
    }
    if (!allowed.includes(entry)) allowed.push(entry)
  }
  return allowed
}

/**
 * Reject non-finite or non-integer coordinates before they reach AppleScript.
 * @param {number} value - the value to check.
 * @param {string} name - the argument name for the error message.
 */
function assertInteger(value, name) {
  if (!Number.isInteger(value)) {
    throw new Error(name + ' must be an integer, got ' + String(value))
  }
}
