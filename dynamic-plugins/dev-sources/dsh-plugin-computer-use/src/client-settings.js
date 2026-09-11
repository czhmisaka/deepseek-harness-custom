/**
 * Browser half additions for the computer-use settings surface: a dedicated
 * section in the settings page. Beyond the master switch it renders the
 * permission allocation (per-action toggles over the deployment allowlist,
 * with 只读观察 / 完全控制 presets), the display picker (which screen the
 * model may capture and control), and an environment status row (macOS TCC
 * permissions and cliclick availability).
 *
 * All controls read and write the host-registered `computer-use` settings
 * namespace (persisted in settings.yaml), which the tool execute path checks
 * live. The deployment allowlist, display list, and environment probes ride
 * the schema's `computerUi` metadata bag: the host plugin fills them in
 * asynchronously and every settings describe re-serializes the schema, so the
 * panel reads them from the shared describe mirror without any private RPC.
 * @module dsh-tool-computer-use/client-settings
 */

import { useEffect, useState } from 'react'

/** Settings namespace owned by the computer-use feature. */
export const SETTINGS_NS = 'computer-use'

const COLOR_MUTED = 'var(--dsw-text-muted, #8a8f98)'
const COLOR_ACCENT = 'var(--dsw-accent, #4f8ef7)'
const COLOR_DANGER = 'var(--dsw-danger, #e5534b)'
const COLOR_OK = 'var(--dsw-success, #3fb950)'
const COLOR_WARN = 'var(--dsw-warning, #d29922)'

/** Per-action presentation: label, hint, and the group it renders under. */
const ACTION_META = {
  screenshot: { label: '截取屏幕', hint: '截取所选屏幕的画面（需要屏幕录制权限）' },
  cursor_position: { label: '读取光标位置', hint: '查询当前鼠标坐标' },
  left_click: { label: '左键单击', hint: '在指定位置左键点击' },
  double_click: { label: '双击', hint: '需要 cliclick' },
  right_click: { label: '右键单击', hint: '需要 cliclick' },
  move: { label: '移动指针', hint: '移动鼠标不点击，需要 cliclick' },
  drag: { label: '拖拽', hint: '按下并拖动，需要 cliclick' },
  type: { label: '输入文本', hint: '向焦点应用输入任意文本' },
  key: { label: '按键', hint: '单键与组合键（如 cmd+c）' },
  scroll: { label: '滚动', hint: '键盘式滚动（方向键连按）' },
  wait: { label: '等待', hint: '等待指定毫秒数，无副作用' },
}

/** Groups in display order; every action must belong to exactly one group. */
const ACTION_GROUPS = [
  { key: 'observe', label: '观察', actions: ['screenshot', 'cursor_position'] },
  { key: 'mouse', label: '鼠标', actions: ['left_click', 'double_click', 'right_click', 'move', 'drag'] },
  { key: 'keyboard', label: '键盘', actions: ['type', 'key', 'scroll'] },
  { key: 'other', label: '其他', actions: ['wait'] },
]

/** Actions the 只读观察 preset keeps enabled; everything else is denied. */
const READONLY_ACTIONS = ['screenshot', 'cursor_position']

/** Every known action, for denying the complement of a preset. */
const ALL_ACTIONS = Object.keys(ACTION_META)

/**
 * Read the plugin's `computerUi` metadata bag out of the shared settings
 * describe snapshot. The wire schema is a schemastery refs envelope
 * (`{uid, refs}`): the root node's `meta.computerUi` holds what this panel
 * needs. Malformed or missing data degrades to empty defaults.
 * @param {object|undefined} describeSnapshot - the shared mirror snapshot.
 * @returns {{allowedActions: string[]|undefined, displays: Array<object>, environment: object|null}} the UI metadata.
 */
function readComputerUi(describeSnapshot) {
  const view = describeSnapshot?.view
  if (view === null || typeof view !== 'object' || !Array.isArray(view.namespaces)) {
    return { allowedActions: undefined, displays: [], environment: null }
  }
  const entry = view.namespaces.find((ns) => ns !== null && typeof ns === 'object' && ns.ns === SETTINGS_NS)
  const envelope = entry?.schema
  const refs = envelope !== null && typeof envelope === 'object' ? envelope.refs : undefined
  const root = refs !== undefined && envelope !== null && typeof envelope === 'object' ? refs[envelope.uid] : undefined
  const ui = root?.meta?.computerUi
  return {
    allowedActions: Array.isArray(ui?.allowedActions) ? ui.allowedActions.filter((a) => typeof a === 'string') : undefined,
    displays: Array.isArray(ui?.displays) ? ui.displays.filter((d) => d !== null && typeof d === 'object') : [],
    environment: ui?.environment !== null && ui?.environment !== undefined && typeof ui.environment === 'object' ? ui.environment : null,
  }
}

/**
 * One toggle switch matching the master-switch styling.
 * @param {{checked: boolean, disabled: boolean, onToggle: () => void, title: string}} props - switch state.
 */
function Toggle({ checked, disabled, onToggle, title }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={title}
      disabled={disabled}
      onClick={onToggle}
      style={{
        position: 'relative', width: 36, height: 20, borderRadius: 10,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0,
        opacity: disabled ? 0.45 : 1,
        background: checked ? COLOR_ACCENT : 'rgba(127,127,127,0.35)',
        transition: 'background 0.15s',
      }}
    >
      <span
        style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}

/** Shared row shell for every item line. */
function Row({ title, hint, children }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '9px 0', width: '100%',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
        {hint !== undefined && (
          <div style={{ fontSize: 12, color: COLOR_MUTED, marginTop: 2, lineHeight: '17px' }}>{hint}</div>
        )}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>
    </div>
  )
}

/**
 * Build the master enable switch (unchanged contract, tightened copy).
 * @param {object} scope - `ctx.settingsScope.bind({ namespace: SETTINGS_NS })` handle.
 * @returns {object} the row component.
 */
function createEnableRow(scope) {
  function EnableRow() {
    const [snapshot, setSnapshot] = useState(() => scope.getSnapshot())
    useEffect(() => scope.subscribe(() => setSnapshot(scope.getSnapshot())), [scope])
    const enabled = snapshot.status === 'ready' ? snapshot.value?.enabled !== false : true
    const writable = snapshot.status === 'ready' && snapshot.writable
    const [pending, setPending] = useState(false)
    const toggle = () => {
      setPending(true)
      scope.set('enabled', !enabled).catch(() => {}).finally(() => setPending(false))
    }
    return (
      <Row
        title="Computer 使用（computer use）"
        hint="允许模型截取屏幕并控制本机鼠标与键盘。关闭后所有 computer 动作立即被拒绝。"
      >
        <Toggle checked={enabled} disabled={pending || !writable} onToggle={toggle} title="启用 Computer 使用" />
      </Row>
    )
  }
  return EnableRow
}

/**
 * Build the environment status row: macOS permissions (Screen Recording,
 * Accessibility), cliclick availability, and the active display count. The
 * data rides the schema metadata bag; `null` means still probing or the
 * describe mirror predates the fill (the mirror refreshes on the next
 * settings write, page load, or reconnect).
 * @param {() => object|undefined} readUiMeta - describe-derived metadata reader.
 * @returns {object} the row component.
 */
function createEnvironmentRow(readUiMeta) {
  function EnvironmentRow() {
    const ui = readUiMeta() ?? {}
    const env = ui.environment
    const displayCount = ui.displays?.length ?? 0
    if (env === null || env === undefined) {
      return (
        <Row title="运行环境" hint={displayCount > 0 ? `已发现 ${displayCount} 台显示器；权限状态检测中…` : '正在检测权限状态…'}>
          <span style={{ color: COLOR_MUTED, fontSize: 12 }}>检测中…</span>
        </Row>
      )
    }
    const items = [
      { ok: env.screenRecording, label: '屏幕录制', fix: '系统设置 → 隐私与安全性 → 屏幕录制，授权启动 dsh 的应用后重启 dsh' },
      { ok: env.accessibility, label: '辅助功能', fix: '系统设置 → 隐私与安全性 → 辅助功能，授权启动 dsh 的应用后重启 dsh' },
      { ok: env.cliclick, label: 'cliclick（双击/右键/拖拽需要）', fix: 'brew install cliclick' },
    ]
    const failing = items.filter((item) => item.ok === false)
    return (
      <Row
        title={displayCount > 0 ? `运行环境 · ${displayCount} 台显示器` : '运行环境'}
        hint={failing.length === 0
          ? '权限齐备。截屏每动作都会真实执行，请留意模型正在操作的界面。'
          : failing.map((item) => `${item.label}：${item.fix}`).join('；')}
      >
        <span style={{ display: 'flex', gap: 6 }}>
          {items.map((item) => (
            <span
              key={item.label}
              title={item.ok === false ? item.fix : item.label + ' 已就绪'}
              style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap',
                color: item.ok === true ? COLOR_OK : item.ok === false ? COLOR_DANGER : COLOR_MUTED,
                border: '1px solid', borderColor: item.ok === true ? COLOR_OK : item.ok === false ? COLOR_DANGER : 'rgba(127,127,127,0.4)',
              }}
            >
              {item.ok === true ? '✓' : item.ok === false ? '✕' : '–'} {item.label.split('（')[0]}
            </span>
          ))}
        </span>
      </Row>
    )
  }
  return EnvironmentRow
}

/**
 * Build the permission allocation row: presets plus per-action toggles in
 * groups. The deployment allowlist (schema metadata) marks actions the
 * deployment never granted — those toggles are locked off; the user layer
 * only narrows what the deployment allowed.
 * @param {object} scope - the bound settings scope.
 * @param {() => object|undefined} readUiMeta - describe-derived metadata reader.
 * @returns {object} the row component.
 */
function createActionsRow(scope, readUiMeta) {
  function ActionsRow() {
    const [snapshot, setSnapshot] = useState(() => scope.getSnapshot())
    useEffect(() => scope.subscribe(() => setSnapshot(scope.getSnapshot())), [scope])
    const [pending, setPending] = useState(false)
    const ui = readUiMeta() ?? {}
    const allowedActions = ui.allowedActions
    const writable = snapshot.status === 'ready' && snapshot.writable
    const userActions = snapshot.status === 'ready' && snapshot.value?.actions !== null && typeof snapshot.value?.actions === 'object'
      ? snapshot.value.actions
      : {}

    const isAllowed = (action) => allowedActions === undefined || allowedActions.includes(action)
    const isEnabled = (action) => isAllowed(action) && userActions[action] !== false

    const writeActions = (next) => {
      setPending(true)
      scope.set('actions', next).catch(() => {}).finally(() => setPending(false))
    }
    const toggleAction = (action) => {
      writeActions({ ...userActions, [action]: !isEnabled(action) })
    }
    const applyReadonlyPreset = () => {
      const next = {}
      for (const action of ALL_ACTIONS) next[action] = READONLY_ACTIONS.includes(action)
      writeActions(next)
    }
    const applyFullPreset = () => {
      setPending(true)
      scope.unset('actions').catch(() => {}).finally(() => setPending(false))
    }

    const effectiveCount = (allowedActions ?? ALL_ACTIONS).filter(isEnabled).length
    const disabled = pending || !writable

    return (
      <div style={{ padding: '9px 0', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>动作权限分配</div>
            <div style={{ fontSize: 12, color: COLOR_MUTED, marginTop: 2, lineHeight: '17px' }}>
              逐项决定模型可执行的动作（当前生效 {effectiveCount}/{(allowedActions ?? ALL_ACTIONS).length} 项）。
              部署配置是上限，这里只能在其范围内收窄。
            </div>
          </div>
          <span style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button type="button" disabled={disabled} onClick={applyReadonlyPreset}
              style={presetButtonStyle(disabled)}>只读观察</button>
            <button type="button" disabled={disabled} onClick={applyFullPreset}
              style={presetButtonStyle(disabled)}>完全控制</button>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '2px 24px', marginTop: 8 }}>
          {ACTION_GROUPS.map((group) => (
            <div key={group.key}>
              <div style={{ fontSize: 11, color: COLOR_MUTED, marginTop: 6, marginBottom: 2, letterSpacing: '0.05em' }}>
                {group.label}
              </div>
              {group.actions.map((action) => {
                const meta = ACTION_META[action]
                const deploymentLocked = !isAllowed(action)
                const on = isEnabled(action)
                return (
                  <label
                    key={action}
                    title={deploymentLocked ? '部署未授权该动作（cordis.patch.yml 的 allowedActions）' : meta.hint}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0',
                      cursor: disabled || deploymentLocked ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={deploymentLocked ? false : on}
                      disabled={disabled || deploymentLocked}
                      onChange={() => toggleAction(action)}
                      style={{ accentColor: COLOR_ACCENT, margin: 0 }}
                    />
                    <span style={{ fontSize: 12.5, color: deploymentLocked ? COLOR_MUTED : undefined }}>
                      {meta.label}
                      {deploymentLocked && <span style={{ fontSize: 10.5, color: COLOR_MUTED, marginLeft: 4 }}>（部署未授权）</span>}
                    </span>
                  </label>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }
  return ActionsRow
}

/** Preset button style shared by both preset buttons. */
function presetButtonStyle(disabled) {
  return {
    fontSize: 12, padding: '3px 10px', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid rgba(127,127,127,0.35)', background: 'transparent',
    color: 'inherit', opacity: disabled ? 0.5 : 1,
  }
}

/**
 * Build the display picker row: which screen the model may capture and
 * control. Options come from the schema metadata's live display list
 * (main display first, then others with their global placement); 'main' is
 * the default. Keyboard input always goes to the focused application.
 * @param {object} scope - the bound settings scope.
 * @param {() => object|undefined} readUiMeta - describe-derived metadata reader.
 * @returns {object} the row component.
 */
function createDisplayRow(scope, readUiMeta) {
  function DisplayRow() {
    const [snapshot, setSnapshot] = useState(() => scope.getSnapshot())
    useEffect(() => scope.subscribe(() => setSnapshot(scope.getSnapshot())), [scope])
    const ui = readUiMeta() ?? {}
    const writable = snapshot.status === 'ready' && snapshot.writable
    const current = snapshot.status === 'ready' && typeof snapshot.value?.display === 'string' && snapshot.value.display.length > 0
      ? snapshot.value.display
      : 'main'
    const displays = Array.isArray(ui.displays) ? ui.displays : []
    const main = displays.find((d) => d.isMain === true) ?? displays[0]
    const [pending, setPending] = useState(false)
    const change = (value) => {
      setPending(true)
      scope.set('display', value).catch(() => {}).finally(() => setPending(false))
    }
    const placement = (display) => {
      if (main === undefined || display.isMain) return display.isMain ? '主屏' : ''
      if (display.x >= main.x + main.width) return '主屏右侧'
      if (display.x + display.width <= main.x) return '主屏左侧'
      if (display.y >= main.y + main.height) return '主屏下方'
      if (display.y + display.height <= main.y) return '主屏上方'
      return '副屏'
    }
    const options = displays.length > 0
      ? displays.map((display) => ({
        value: String(display.index),
        label: `显示器 ${display.index} · ${display.width}×${display.height}`
          + (display.isMain ? '（主屏）' : `（${placement(display)}）`),
      }))
      : [{ value: 'main', label: '主显示器' }]
    return (
      <Row
        title="可用屏幕"
        hint={displays.length > 0
          ? `模型只能截取并控制所选屏幕（当前 ${options.find((o) => o.value === current)?.label ?? '主显示器'}）。键盘输入仍作用于系统当前聚焦的应用；外接显示器后如未出现，刷新页面。`
          : '模型只能截取并控制所选屏幕。显示器列表由插件启动时探测；若刚接入外接显示器，刷新页面或重启 dsh。'}
      >
        <select
          value={options.some((o) => o.value === current) ? current : 'main'}
          disabled={!writable || pending}
          onChange={(event) => change(event.target.value)}
          style={{
            fontSize: 12.5, padding: '4px 8px', borderRadius: 6, color: 'inherit',
            background: 'var(--dsw-bg-subtle, rgba(127,127,127,0.08))',
            border: '1px solid rgba(127,127,127,0.35)', cursor: writable ? 'pointer' : 'not-allowed',
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </Row>
    )
  }
  return DisplayRow
}

/** Section shell: renders the declared child items through the render-slot share. */
function SectionShell({ renderSlot }) {
  return (
    <div>
      {renderSlot('settings.computer.item', {})}
    </div>
  )
}

/**
 * Register the Computer 使用 section and its item rows. All registrations
 * wait on their declaring slots via slots.inject, so activation order never
 * matters.
 * @param {object} ctx - client cordis context.
 */
export function registerSettingsSection(ctx) {
  const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS })
  // The UI metadata reader: the describe face is the same shared snapshot the
  // scope derives from, so the panel can never disagree with the scope about
  // the document. Subscribing to it re-renders on any describe refresh.
  function readUiMeta() {
    try {
      const describe = ctx.settingsScope.describe()
      const mirror = describe?.getSnapshot()
      const view = mirror?.view
      if (view === undefined) return undefined
      const entry = Array.isArray(view.namespaces)
        ? view.namespaces.find((ns) => ns !== null && typeof ns === 'object' && ns.ns === SETTINGS_NS)
        : undefined
      const envelope = entry?.schema
      if (envelope === null || typeof envelope !== 'object') return undefined
      const refs = envelope.refs
      const root = refs !== undefined ? refs[envelope.uid] : undefined
      return root?.meta?.computerUi
    } catch {
      return undefined
    }
  }
  function useDescribeSubscription() {
    const [, force] = useState(0)
    useEffect(() => {
      let live = true
      let unsubscribe
      try {
        const describe = ctx.settingsScope.describe()
        unsubscribe = describe?.subscribe(() => { if (live) force((n) => n + 1) })
      } catch {
        unsubscribe = undefined
      }
      return () => { live = false; unsubscribe?.() }
    }, [])
  }

  const EnableRow = createEnableRow(scope)
  const EnvironmentRow = createEnvironmentRow(readUiMeta)
  const ActionsRow = createActionsRow(scope, readUiMeta)
  const DisplayRow = createDisplayRow(scope, readUiMeta)
  const Wrap = (Component) => function Wrapped() {
    useDescribeSubscription()
    return <Component />
  }

  ctx.slots.inject('settings.section', () =>
    ctx.slots.register({
      name: 'settings.section',
      id: 'computer-use',
      order: 15,
      label: () => 'Computer 使用',
      children: {
        'settings.computer.item': { kind: 'list', scope: 'root' },
      },
    }, SectionShell))
  ctx.slots.inject('settings.computer.item', () => {
    ctx.slots.register({ name: 'settings.computer.item', id: 'enable', order: 10 }, EnableRow)
    ctx.slots.register({ name: 'settings.computer.item', id: 'environment', order: 20 }, Wrap(EnvironmentRow))
    ctx.slots.register({ name: 'settings.computer.item', id: 'actions', order: 30 }, Wrap(ActionsRow))
    ctx.slots.register({ name: 'settings.computer.item', id: 'display', order: 40 }, Wrap(DisplayRow))
  })
}
