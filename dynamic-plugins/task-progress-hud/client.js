const CSS = [
  '.ph-hud { position: absolute; right: 16px; bottom: 148px; width: 330px; z-index: 40; pointer-events: none; font-size: 12px; line-height: 1.45; }',
  '.ph-panel { pointer-events: auto; display: flex; flex-direction: column; max-height: 58vh; background: var(--dsw-alias-bg-overlay); border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; box-shadow: 0 10px 32px rgba(0,0,0,.18); overflow: hidden; animation: ph-in .18s ease-out; }',
  '.ph-head { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); }',
  '.ph-head-title { font-weight: 600; color: var(--dsw-alias-label-primary); }',
  '.ph-head-count { flex: 1; color: var(--dsw-alias-label-secondary); }',
  '.ph-head-btn { border: none; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; font-size: 14px; line-height: 1; padding: 2px 6px; border-radius: 5px; }',
  '.ph-head-btn:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }',
  '.ph-body { overflow-y: auto; padding: 8px 12px 10px; display: flex; flex-direction: column; gap: 10px; }',
  '.ph-task { display: flex; flex-direction: column; gap: 4px; animation: ph-in .18s ease-out; }',
  '.ph-line1 { display: flex; align-items: center; gap: 6px; min-width: 0; }',
  '.ph-kind { color: var(--dsw-alias-label-secondary); flex: none; }',
  '.ph-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-primary); font-weight: 500; }',
  '.ph-metric { flex: none; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }',
  '.ph-bar { position: relative; height: 5px; border-radius: 3px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; }',
  '.ph-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; background: var(--dsw-alias-brand-primary); background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.22) 0 6px, transparent 6px 12px); background-size: 28px 28px; animation: ph-stripes .9s linear infinite; transition: width .35s ease; }',
  '.ph-fill.ph-indet { width: 32%; background-image: none; animation: ph-slide 1.1s ease-in-out infinite; }',
  '.ph-fill.ph-st-completed { background: var(--dsw-alias-state-success-primary); background-image: none; animation: none; }',
  '.ph-fill.ph-st-failed { background: var(--dsw-alias-state-error-primary); background-image: none; animation: none; }',
  '.ph-fill.ph-st-cancelled { background: var(--dsw-alias-label-secondary); background-image: none; animation: none; }',
  '.ph-fill.ph-st-paused { background: var(--dsw-alias-state-warn-primary); background-image: none; }',
  '.ph-detail { color: var(--dsw-alias-label-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
  '.ph-items { display: flex; flex-direction: column; gap: 2px; padding: 4px 0 0 20px; }',
  '.ph-item { display: flex; gap: 6px; color: var(--dsw-alias-label-secondary); min-width: 0; }',
  '.ph-item-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
  '.ph-item.ph-ist-completed .ph-item-mark { color: var(--dsw-alias-state-success-primary); }',
  '.ph-item.ph-ist-in_progress { color: var(--dsw-alias-label-primary); }',
  '.ph-item.ph-ist-in_progress .ph-item-mark { color: var(--dsw-alias-brand-primary); }',
  '.ph-tool .ph-label { font-weight: 400; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }',
  '.ph-spin { flex: none; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--dsw-alias-border-l2); border-top-color: var(--dsw-alias-brand-primary); animation: ph-spin .8s linear infinite; }',
  '.ph-pill { pointer-events: auto; display: flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary); box-shadow: 0 8px 24px rgba(0,0,0,.16); cursor: pointer; font-size: 12px; }',
  '.ph-pill-pct { color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }',
  '.ph-st-completed .ph-label, .ph-st-cancelled .ph-label { color: var(--dsw-alias-label-secondary); }',
  '.ph-self { display: flex; flex-direction: column; gap: 8px; padding: 4px 2px; font-size: 12.5px; }',
  '.ph-self-head { font-weight: 600; color: var(--dsw-alias-label-primary); }',
  '.ph-self-text { color: var(--dsw-alias-label-secondary); }',
  '.ph-self-btns { display: flex; gap: 8px; flex-wrap: wrap; }',
  '.ph-btn { border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 12px; }',
  '.ph-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }',
  '.ph-btn:disabled { opacity: .5; cursor: default; }',
  '@keyframes ph-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }',
  '@keyframes ph-stripes { from { background-position: 0 0; } to { background-position: 28px 0; } }',
  '@keyframes ph-slide { 0% { transform: translateX(-110%); } 100% { transform: translateX(340%); } }',
  '@keyframes ph-spin { to { transform: rotate(360deg); } }',
].join('\n')

return {
  inject: ['timer'],
  apply(ctx) {
    const POLL_MS = 700
    const TERMINAL_VISIBLE_MS = 6000

    const slots = ctx.get('slots')
    if (slots === undefined) { console.error('[progress-hud] slots 服务不可用'); return }

    const clientDisposers = new Set()
    ctx.effect(() => () => {
      for (const d of clientDisposers) { try { d() } catch (e) {} }
      clientDisposers.clear()
    }, 'progress-hud: client teardown')
    const own = (d) => { if (typeof d === 'function') clientDisposers.add(d); return d }

    styles.insert(CSS)

    const KIND_ICON = { todo: '☰', workflow: '⚙', subagent: '◈', job: '▤', goal: '◎', manual: '▶' }

    function fmtDur(ms) {
      const s = Math.max(0, Math.floor(ms / 1000))
      if (s < 60) return s + 's'
      const m = Math.floor(s / 60)
      const rs = s % 60
      if (m < 60) return m + 'm' + (rs > 0 ? rs + 's' : '')
      const h = Math.floor(m / 60)
      return h + 'h' + (m % 60) + 'm'
    }

    function percentOf(t) {
      if (!t) return null
      if (t.status === 'completed') return 1
      if (typeof t.current === 'number' && typeof t.total === 'number' && t.total > 0) {
        return Math.max(0, Math.min(1, t.current / t.total))
      }
      return null
    }

    function ProgressHud() {
      const [snap, setSnap] = React.useState(null)
      const [collapsed, setCollapsed] = React.useState(false)
      const [expandedKeys, setExpandedKeys] = React.useState({})

      React.useEffect(() => {
        let alive = true
        const tick = () => {
          host.call('progress-hud.snapshot').then((data) => {
            if (!alive) return
            if (data && typeof data === 'object' && Array.isArray(data.tasks)) setSnap(data)
          }).catch(() => {})
        }
        tick()
        const h = ctx.interval(tick, POLL_MS)
        return () => { alive = false; h() }
      }, [])

      const localNow = Date.now()
      const tasksAll = snap && Array.isArray(snap.tasks) ? snap.tasks : []
      const toolsAll = snap && Array.isArray(snap.tools) ? snap.tools : []

      const running = []
      const finished = []
      for (const t of tasksAll) {
        if (!t || typeof t.key !== 'string') continue
        const terminal = t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled'
        if (terminal) {
          const ended = typeof t.endedAt === 'number' ? t.endedAt : localNow
          if (localNow - ended <= TERMINAL_VISIBLE_MS) finished.push(t)
        } else {
          running.push(t)
        }
      }
      if (running.length + finished.length + toolsAll.length === 0) return null

      const toggleExpand = (key) => {
        setExpandedKeys((prev) => {
          const next = {}
          for (const k in prev) next[k] = prev[k]
          next[key] = !prev[key]
          return next
        })
      }

      const renderTask = (t) => {
        const pct = percentOf(t)
        const elapsed = localNow - (typeof t.startedAt === 'number' ? t.startedAt : localNow)
        const bits = []
        if (typeof t.current === 'number' && typeof t.total === 'number' && t.total > 0) bits.push(String(Math.round(t.current)) + '/' + String(Math.round(t.total)))
        if (t.status === 'running' || t.status === 'paused') bits.push(fmtDur(elapsed))
        else if (t.status === 'completed') bits.push('✓')
        else if (t.status === 'failed') bits.push('✕')
        else if (t.status === 'cancelled') bits.push('已取消')
        const hasItems = Array.isArray(t.items) && t.items.length > 0
        const open = hasItems && expandedKeys[t.key] === true
        const fillClass = 'ph-fill' + (pct === null ? ' ph-indet' : '') + (t.status !== 'running' ? (' ph-st-' + t.status) : '')
        const fillStyle = pct === null ? undefined : { width: Math.max(3, Math.round(pct * 100)) + '%' }
        return React.createElement('div', {
          className: 'ph-task' + (hasItems ? ' ph-clickable' : ''),
          key: t.key,
          onClick: hasItems ? () => toggleExpand(t.key) : undefined,
        },
          React.createElement('div', { className: 'ph-line1' },
            React.createElement('span', { className: 'ph-kind' }, KIND_ICON[t.kind] || '•'),
            React.createElement('span', { className: 'ph-label', title: t.label }, t.label),
            React.createElement('span', { className: 'ph-metric' }, bits.join(' · ')),
          ),
          React.createElement('div', { className: 'ph-bar' },
            React.createElement('div', { className: fillClass, style: fillStyle }),
          ),
          t.detail ? React.createElement('div', { className: 'ph-detail', title: t.detail }, t.detail) : null,
          open ? React.createElement('div', { className: 'ph-items' },
            t.items.map((it, i) => React.createElement('div', { className: 'ph-item ph-ist-' + it.status, key: i },
              React.createElement('span', { className: 'ph-item-mark' }, it.status === 'completed' ? '✓' : (it.status === 'in_progress' ? '▸' : '○')),
              React.createElement('span', { className: 'ph-item-text', title: it.content }, it.content),
            )),
          ) : null,
        )
      }

      const renderTool = (tool) => {
        const elapsed = localNow - (typeof tool.startedAt === 'number' ? tool.startedAt : localNow)
        return React.createElement('div', { className: 'ph-task ph-tool', key: tool.key },
          React.createElement('div', { className: 'ph-line1' },
            React.createElement('span', { className: 'ph-spin' }),
            React.createElement('span', { className: 'ph-label', title: tool.name }, tool.name),
            React.createElement('span', { className: 'ph-metric' }, fmtDur(elapsed)),
          ),
          tool.summary ? React.createElement('div', { className: 'ph-detail', title: tool.summary }, tool.summary) : null,
        )
      }

      if (collapsed) {
        let topPct = null
        for (const t of running) {
          const p = percentOf(t)
          if (p !== null) { topPct = p; break }
        }
        return React.createElement('div', { className: 'ph-hud' },
          React.createElement('button', { className: 'ph-pill', onClick: () => setCollapsed(false), title: '展开任务进度' },
            React.createElement('span', { className: 'ph-spin' }),
            React.createElement('span', null, (running.length + toolsAll.length) + ' 项进行中'),
            topPct !== null ? React.createElement('span', { className: 'ph-pill-pct' }, Math.round(topPct * 100) + '%') : null,
          ),
        )
      }

      return React.createElement('div', { className: 'ph-hud' },
        React.createElement('div', { className: 'ph-panel' },
          React.createElement('div', { className: 'ph-head' },
            React.createElement('span', { className: 'ph-head-title' }, '任务进度'),
            React.createElement('span', { className: 'ph-head-count' }, (running.length + toolsAll.length) > 0 ? ((running.length + toolsAll.length) + ' 项进行中') : '收尾中'),
            React.createElement('button', { className: 'ph-head-btn', onClick: () => setCollapsed(true), title: '收起' }, '—'),
          ),
          React.createElement('div', { className: 'ph-body' },
            running.map(renderTask),
            finished.map(renderTask),
            toolsAll.map(renderTool),
          ),
        ),
      )
    }

    function SelfPanel() {
      const [busy, setBusy] = React.useState(false)
      const run = (mode) => {
        setBusy(true)
        host.call('progress-hud.demo', { mode }).catch(() => {})
        own(ctx.timeout(() => setBusy(false), 900))
      }
      return React.createElement('div', { className: 'ph-self' },
        React.createElement('div', { className: 'ph-self-head' }, '📊 任务进度 HUD 运行中'),
        React.createElement('div', { className: 'ph-self-text' }, '右下角会自动浮现可量化任务的进度面板：任务清单、工作流、子代理、后台作业、目标轮次；超过 4 秒的工具调用也会以转圈行显示。也可以让我用 task_progress 工具手动上报进度。'),
        React.createElement('div', { className: 'ph-self-btns' },
          React.createElement('button', { className: 'ph-btn', onClick: () => run('quant'), disabled: busy }, '▶ 演示量化任务'),
          React.createElement('button', { className: 'ph-btn', onClick: () => run('agent'), disabled: busy }, '▶ 演示后台代理'),
        ),
      )
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'progress-hud', order: 60, label: '任务进度' },
      () => React.createElement(ProgressHud),
    ))
    slots.inject('tool.view.cordis', () => slots.register(
      { name: 'tool.view.cordis', key: 'self' },
      () => React.createElement(SelfPanel),
    ))

    console.log('[progress-hud] client half ready')
  },
}
