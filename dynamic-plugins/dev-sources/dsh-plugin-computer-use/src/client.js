/**
 * Browser half of the computer-use plugin: one keyed toolview for the
 * `computer` tool. Everything renders from the raw wire events the turn
 * already knows — running calls read `argsRaw`, settled results read the
 * paired call head and error state — so the view is a pure local derivation
 * and malformed data falls back to the generic tool row by rendering nothing.
 * @module dsh-tool-computer-use/client
 */

import { useEffect, useState } from 'react'
import { registerSettingsSection } from './client-settings.js'

/** Cordis client-plugin name used by loader diagnostics. */
export const name = 'client-computer-use'

/** Slot registry, the Session object layer for attachment bytes, and the standard-props provider. */
export const inject = ['slots', 'sessions', 'uiSession', 'settingsScope']

const COLOR_ACCENT = 'var(--dsw-accent, #4f8ef7)'
const COLOR_ERROR = 'var(--dsw-danger, #e5534b)'
const COLOR_MUTED = 'var(--dsw-text-muted, #8a8f98)'

/**
 * Describe one pending action in present tense, from the validated wire args.
 * @param {unknown} args - parsed `computer` call arguments (untrusted shape).
 * @returns {string|undefined} the running headline, or undefined for malformed input.
 */
function runningHeadline(args) {
  if (args === null || typeof args !== 'object' || typeof args.action !== 'string') return undefined
  const at = (pair) => (Array.isArray(pair) && pair.length === 2 ? `(${pair[0]}, ${pair[1]})` : '')
  switch (args.action) {
    case 'screenshot': return '正在截取屏幕…'
    case 'cursor_position': return '正在读取光标位置…'
    case 'left_click': return at(args.coordinate) ? `正在左键点击 ${at(args.coordinate)}…` : '正在左键点击…'
    case 'double_click': return at(args.coordinate) ? `正在双击 ${at(args.coordinate)}…` : '正在双击…'
    case 'right_click': return at(args.coordinate) ? `正在右键点击 ${at(args.coordinate)}…` : '正在右键点击…'
    case 'move': return at(args.coordinate) ? `正在移动鼠标到 ${at(args.coordinate)}…` : '正在移动鼠标…'
    case 'drag': return `正在拖拽 ${at(args.start_coordinate)} → ${at(args.coordinate)}…`
    case 'type': return typeof args.text === 'string' ? `正在输入 ${args.text.length} 个字符…` : '正在输入文本…'
    case 'key': return typeof args.key === 'string' ? `正在按下 ${args.key}…` : '正在按键…'
    case 'scroll': return `正在${args.direction === 'up' ? '向上' : args.direction === 'left' ? '向左' : args.direction === 'right' ? '向右' : '向下'}滚动 ${typeof args.amount === 'number' ? args.amount : 3} 格…`
    case 'wait': return `正在等待 ${typeof args.durationMs === 'number' ? args.durationMs : '?'} ms…`
    default: return `正在执行 ${args.action}…`
  }
}

/**
 * Describe one settled action, from the paired call arguments.
 * @param {unknown} args - parsed `computer` call arguments (untrusted shape).
 * @returns {string|undefined} the past-tense summary, or undefined for malformed input.
 */
function settledHeadline(args) {
  if (args === null || typeof args !== 'object' || typeof args.action !== 'string') return undefined
  const at = (pair) => (Array.isArray(pair) && pair.length === 2 ? `(${pair[0]}, ${pair[1]})` : '')
  switch (args.action) {
    case 'screenshot': return '已截取屏幕'
    case 'cursor_position': return '已读取光标位置'
    case 'left_click': return `已左键点击 ${at(args.coordinate)}`.trim()
    case 'double_click': return `已双击 ${at(args.coordinate)}`.trim()
    case 'right_click': return `已右键点击 ${at(args.coordinate)}`.trim()
    case 'move': return `已移动鼠标到 ${at(args.coordinate)}`.trim()
    case 'drag': return `已拖拽 ${at(args.start_coordinate)} → ${at(args.coordinate)}`
    case 'type': return `已输入 ${typeof args.text === 'string' ? args.text.length : '?'} 个字符`
    case 'key': return `已按下 ${typeof args.key === 'string' ? args.key : '?'}`
    case 'scroll': return `已${args.direction === 'up' ? '向上' : args.direction === 'left' ? '向左' : args.direction === 'right' ? '向右' : '向下'}滚动`
    case 'wait': return `已等待 ${typeof args.durationMs === 'number' ? formatDuration(args.durationMs) : '?'}`
    default: return `已执行 ${args.action}`
  }
}

/**
 * Parse the frozen raw arguments of a computer call.
 * @param {string} argsRaw - the raw JSON argument text from the wire event.
 * @returns {unknown} parsed arguments, or undefined when unparsable.
 */
function parseArgs(argsRaw) {
  try {
    return JSON.parse(argsRaw)
  } catch {
    return undefined
  }
}

/**
 * Format one duration for the settled row: sub-second stays in ms, otherwise
 * one decimal in seconds.
 * @param {number} ms - duration in milliseconds.
 * @returns {string} the formatted duration.
 */
function formatDuration(ms) {
  return ms < 1000 ? ms + ' ms' : (ms / 1000).toFixed(1) + ' 秒'
}

/**
 * Extract the first image attachment from a settled result's content blocks.
 * @param {unknown} content - the result content block array from the wire.
 * @returns {{attachmentId: string, mediaType: string}|undefined} the image ref, or undefined.
 */
function firstImageAttachment(content) {
  if (!Array.isArray(content)) return undefined
  for (const block of content) {
    if (block !== null && typeof block === 'object' && block.type === 'image'
      && block.attachment !== null && typeof block.attachment === 'object'
      && typeof block.attachment.attachmentId === 'string') {
      return { attachmentId: block.attachment.attachmentId, mediaType: typeof block.attachment.mediaType === 'string' ? block.attachment.mediaType : 'image/png' }
    }
  }
  return undefined
}

/**
 * Load one session-authorized attachment as an object URL through the Session
 * object layer, with a per-plugin-instance cache. The cache and URL release
 * table live in the apply closure — never module level.
 * @param {object} sessions - the injected ISessions service.
 * @returns {(sessionId: string, attachmentId: string) => Promise<string>} loader.
 */
function createImageLoader(sessions) {
  const cache = new Map()
  return (sessionId, attachmentId) => {
    const key = sessionId + ':' + attachmentId
    const cached = cache.get(key)
    if (cached !== undefined) return cached
    const pending = (async () => {
      const binding = sessions.binding(sessionId)
      if (binding === undefined) throw new Error('unknown session')
      const result = await binding.session.readAttachment(attachmentId)
      if (!result.ok) throw new Error(result.error.code + ': ' + result.error.message)
      const bytes = Uint8Array.from(result.value.data)
      const mediaType = result.value.attachment.mediaType
      if (typeof URL.createObjectURL !== 'function') {
        let binary = ''
        for (const byte of bytes) binary += String.fromCharCode(byte)
        return 'data:' + mediaType + ';base64,' + btoa(binary)
      }
      const url = URL.createObjectURL(new Blob([bytes.buffer], { type: mediaType }))
      // Release when the session list drops this binding is out of scope for a
      // thumbnail; the browser reclaims on navigation. Keep the URL reachable
      // for the cache lifetime instead.
      return url
    })()
    cache.set(key, pending)
    pending.catch(() => cache.delete(key))
    return pending
  }
}

/**
 * The settled screenshot thumbnail: loads the attachment through the Session
 * object layer and renders it as a bounded inline image. Fails quiet — a
 * failed load simply leaves the thumbnail out.
 * @param {{sessionId: unknown, loadImage: (sessionId: unknown, id: string) => Promise<string>, attachmentId: string}} props - loader and identity.
 */
function ScreenshotThumbnail({ load, attachmentId }) {
  const [url, setUrl] = useState(undefined)
  useEffect(() => {
    let live = true
    setUrl(undefined)
    load(attachmentId).then((resolved) => {
      if (live) setUrl(resolved)
    }).catch(() => {})
    return () => { live = false }
  }, [attachmentId, load])
  if (url === undefined) {
    return (
      <span style={{ color: COLOR_MUTED, fontSize: 12 }}>截图加载中…</span>
    )
  }
  return (
    <img
      src={url}
      alt="屏幕截图"
      style={{
        maxHeight: 120, maxWidth: 320, borderRadius: 6,
        border: '1px solid rgba(127,127,127,0.25)', display: 'block', cursor: 'zoom-in',
      }}
      onClick={() => window.open(url, '_blank')}
    />
  )
}

/**
 * The atomic row for one `computer` tool call. Renders `null` for anything it
 * cannot confidently describe, which the tool renderer replaces with the
 * generic form.
 */
function ComputerRow({ block, sessionId, loadImage }) {
  const running = block !== null && typeof block === 'object' && block.kind === undefined
  const settled = block !== null && typeof block === 'object' && block.kind === 'tool-result'
  if (!running && !settled) return null

  const callArgs = running
    ? parseArgs(block.argsRaw)
    : block.call === null ? undefined : parseArgs(block.call.argsRaw)
  const headline = running ? runningHeadline(callArgs) : settledHeadline(callArgs)
  if (headline === undefined) return null

  const isError = settled === true && block.isError === true
  const errorMessage = isError && typeof block.error?.name === 'string' ? block.error.name : undefined
  const durationText = settled && typeof block.callTime === 'number'
    ? formatDuration(Math.max(0, block.time - block.callTime))
    : undefined

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', borderRadius: 8, fontSize: 13, lineHeight: '18px',
        background: 'var(--dsw-bg-subtle, rgba(127,127,127,0.08))',
      }}
    >
      <span style={{ fontSize: 14 }} aria-hidden>🖥️</span>
      <span style={{ fontWeight: 500 }}>{headline}</span>
      {running && (
        <span
          aria-hidden
          style={{
            width: 7, height: 7, borderRadius: '50%', background: COLOR_ACCENT,
            animation: 'dsh-computer-pulse 1s ease-in-out infinite',
          }}
        />
      )}
      {settled && errorMessage !== undefined && (
        <span style={{ color: COLOR_ERROR, fontSize: 12 }}>失败 · {errorMessage}</span>
      )}
      {settled && !isError && (
        <span style={{ color: COLOR_MUTED, fontSize: 12 }}>
          本机操作已执行{durationText !== undefined ? ' · 用时 ' + durationText : ''}
        </span>
      )}
      {running && <style>{'@keyframes dsh-computer-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.25 } }'}</style>}
    </div>
  )
}

/**
 * Full row wrapper: adds the screenshot thumbnail line under the action row
 * for settled screenshot results. Malformed input renders nothing, which the
 * tool renderer replaces with the generic form.
 */
function ComputerCard(props) {
  const { block, computerLoadImage } = props
  const row = ComputerRow(props)
  if (row === null) return null
  const settled = block !== null && typeof block === 'object' && block.kind === 'tool-result'
  const image = settled && !block.isError && block.action === undefined
    ? firstImageAttachment(block.content)
    : undefined
  const isScreenshot = settled && !block.isError
    && block.call !== null && typeof block.call === 'object'
    && (() => { try { return JSON.parse(block.call.argsRaw)?.action === 'screenshot' } catch { return false } })()
  if (image === undefined || !isScreenshot || typeof computerLoadImage !== 'function') return row
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {row}
      <ScreenshotThumbnail
        load={computerLoadImage}
        attachmentId={image.attachmentId}
      />
    </div>
  )
}

/**
 * Client plugin entry: claim the `computer` wire tool name in the toolview slot.
 * Wrapped in `slots.inject` because a bare register into a slot whose declaring
 * plugin has not applied yet is an error - the inject waits on the real
 * declaration, reruns after redeclaration, and unwinds with this plugin fiber.
 */
export function apply(ctx) {
  const loadImage = createImageLoader(ctx.sessions)
  ctx.uiSession.provide({
    props: ['computerLoadImage'],
    resolve: binding => ({
      props: {
        computerLoadImage: (attachmentId) => loadImage(binding.sessionId, attachmentId),
      },
    }),
  })
  ctx.slots.inject('tool.call.toolview', () =>
    ctx.slots.register({ name: 'tool.call.toolview', key: 'computer' }, ComputerCard))
  registerSettingsSection(ctx)
}
