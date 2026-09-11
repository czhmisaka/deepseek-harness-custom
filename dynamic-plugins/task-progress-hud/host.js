return {
  inject: ['timer'],
  apply(ctx) {
    const LONG_TOOL_MS = 4000
    const TERMINAL_TTL_MS = 120000
    const MAX_TASKS = 200

    const tasks = new Map()
    const activeTools = new Map()
    const pendingSubagentLabels = []
    const disposers = new Set()
    let seqCounter = 0

    const own = (d) => { if (typeof d === 'function') disposers.add(d); return d }
    ctx.effect(() => () => {
      for (const d of disposers) { try { d() } catch (e) {} }
      disposers.clear()
    }, 'progress-hud: teardown')

    function isPlainObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v) }
    function clampNum(v) { return typeof v === 'number' && Number.isFinite(v) ? v : null }
    function truncate(v, max) {
      const s = String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim()
      return s.length > max ? s.slice(0, max - 1) + '…' : s
    }
    function nextSeq() { seqCounter += 1; return seqCounter }

    function upsertTask(key, patch) {
      let t = tasks.get(key)
      if (!t) {
        t = { key: String(key), kind: 'manual', label: '', detail: '', status: 'running', current: null, total: null, items: null, startedAt: Date.now(), endedAt: null, seq: nextSeq() }
        tasks.set(key, t)
      }
      if (isPlainObject(patch)) {
        for (const f of ['kind', 'label', 'detail', 'status', 'current', 'total', 'items', 'startedAt', 'endedAt']) {
          if (patch[f] !== undefined) t[f] = patch[f]
        }
      }
      return t
    }

    function markTerminal(key, status, detail) {
      const t = tasks.get(key)
      if (!t || t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled') return t
      if (status) t.status = status
      if (detail !== undefined) t.detail = detail
      t.endedAt = Date.now()
      return t
    }

    function sweep(now) {
      for (const k of Array.from(tasks.keys())) {
        const t = tasks.get(k)
        if (t && t.endedAt !== null && now - t.endedAt > TERMINAL_TTL_MS) tasks.delete(k)
      }
      while (tasks.size > MAX_TASKS) {
        let oldest = null
        for (const entry of tasks) {
          if (!oldest || entry[1].seq < oldest[1].seq) oldest = entry
        }
        if (!oldest) break
        tasks.delete(oldest[0])
      }
    }

    function handleTodoWrite(args) {
      const raw = isPlainObject(args) && Array.isArray(args.todos) ? args.todos : null
      if (!raw) return
      const items = []
      for (const it of raw) {
        if (!isPlainObject(it)) continue
        const status = it.status === 'completed' ? 'completed' : it.status === 'in_progress' ? 'in_progress' : 'pending'
        items.push({ content: truncate(it.content, 90), status })
      }
      if (!items.length) return
      let completed = 0
      let inProg = null
      let firstPending = null
      for (const it of items) {
        if (it.status === 'completed') completed += 1
        else if (it.status === 'in_progress' && !inProg) inProg = it
        else if (it.status === 'pending' && !firstPending) firstPending = it
      }
      const signature = items.map((i) => i.content).join('|')
      const existing = tasks.get('todo')
      const allDone = completed >= items.length
      const t = upsertTask('todo', {
        kind: 'todo',
        label: '任务清单',
        detail: allDone ? '全部完成' : (inProg ? ('当前: ' + inProg.content) : (firstPending ? ('下一步: ' + firstPending.content) : '')),
        current: completed,
        total: items.length,
        items,
        status: allDone ? 'completed' : 'running',
        endedAt: allDone ? Date.now() : null,
      })
      if (!existing || existing.listSignature !== signature) {
        t.listSignature = signature
        t.startedAt = Date.now()
      }
    }

    function extractSubagentLabel(args) {
      if (!isPlainObject(args)) return '子代理'
      let desc = ''
      if (typeof args.description === 'string' && args.description) desc = args.description
      else if (typeof args.prompt === 'string' && args.prompt) desc = args.prompt
      return desc ? truncate(desc, 70) : '子代理'
    }

    function summarizeArgs(name, args) {
      if (!isPlainObject(args)) return ''
      const direct = ['command', 'file_path', 'path', 'pattern', 'url', 'query', 'name', 'skill']
      for (const f of direct) {
        const v = args[f]
        if (typeof v === 'string' && v) return truncate(v, 60)
      }
      if (Array.isArray(args.queries)) {
        const j = args.queries.filter((x) => typeof x === 'string').join(' | ')
        if (j) return truncate(j, 60)
      }
      for (const k of Object.keys(args)) {
        const v = args[k]
        if (typeof v === 'string' && v) return truncate(v, 60)
      }
      return ''
    }

    ctx.on('tools/execute', (exec, next) => {
      let key = null
      try {
        if (exec && typeof exec.name === 'string') {
          const args = exec.arguments
          if (exec.name === 'todo_write') handleTodoWrite(args)
          else if (exec.name === 'subagent' || exec.name === 'subagent_fork') {
            pendingSubagentLabels.push(extractSubagentLabel(args))
            if (pendingSubagentLabels.length > 8) pendingSubagentLabels.shift()
          }
          key = String(exec.callId)
          activeTools.set(key, { name: exec.name, summary: summarizeArgs(exec.name, args), startedAt: Date.now() })
        }
      } catch (e) { console.error('[progress-hud] observe tool start:', e && e.message) }
      const done = () => { if (key !== null) activeTools.delete(key) }
      let p
      try { p = next() } catch (e) { done(); throw e }
      return Promise.resolve(p).then(
        (r) => { done(); return r },
        (e) => { done(); throw e },
      )
    })

    ctx.on('workflow/start', (info) => {
      try {
        if (!isPlainObject(info)) return
        const meta = isPlainObject(info.meta) ? info.meta : {}
        upsertTask('wf:' + String(info.id), {
          kind: 'workflow',
          label: truncate(meta.name || '工作流', 60),
          detail: truncate(meta.description || '', 100),
          current: 0, total: null, status: 'running', startedAt: Date.now(), endedAt: null,
        })
      } catch (e) { console.error('[progress-hud] workflow/start:', e && e.message) }
    })
    ctx.on('workflow/phase', (info, title) => {
      try {
        const t = tasks.get('wf:' + String(info && info.id))
        if (t) t.detail = '阶段: ' + truncate(title, 90)
      } catch (e) {}
    })
    ctx.on('workflow/agent-start', (info, agent) => {
      try {
        const t = tasks.get('wf:' + String(info && info.id))
        if (!t || !isPlainObject(agent)) return
        const seq = clampNum(agent.seq)
        if (seq !== null) t.total = Math.max(t.total || 0, seq)
        if (typeof agent.label === 'string' && agent.label) t.detail = '子任务: ' + truncate(agent.label, 84)
      } catch (e) {}
    })
    ctx.on('workflow/agent-end', (info, agent) => {
      try {
        const t = tasks.get('wf:' + String(info && info.id))
        if (t) t.current = (t.current || 0) + 1
      } catch (e) {}
    })
    ctx.on('workflow/end', (info, result) => {
      try {
        const t = tasks.get('wf:' + String(info && info.id))
        if (!t) return
        const stop = isPlainObject(result) ? String(result.stopReason || '') : ''
        if (isPlainObject(result) && clampNum(result.agentsStarted) !== null) t.total = Math.max(t.total || 0, result.agentsStarted)
        t.status = stop === 'completed' ? 'completed' : 'failed'
        t.endedAt = Date.now()
        if (stop !== 'completed' && isPlainObject(result) && typeof result.error === 'string') t.detail = truncate(result.error, 100)
      } catch (e) { console.error('[progress-hud] workflow/end:', e && e.message) }
    })

    ctx.on('subagent/start', (info) => {
      try {
        if (!isPlainObject(info)) return
        const label = pendingSubagentLabels.length ? pendingSubagentLabels.shift() : '子代理'
        upsertTask('sub:' + String(info.runId), {
          kind: 'subagent', label: truncate(label, 70), detail: '后台代理运行中',
          status: 'running', startedAt: Date.now(), endedAt: null,
        })
      } catch (e) { console.error('[progress-hud] subagent/start:', e && e.message) }
    })
    ctx.on('subagent/end', (info) => {
      try {
        if (!isPlainObject(info)) return
        const key = 'sub:' + String(info.runId)
        if (!tasks.has(key)) return
        const stop = typeof info.stopReason === 'string' ? info.stopReason : ''
        if (stop === 'completed') markTerminal(key, 'completed', '子代理已完成')
        else if (stop === 'aborted') markTerminal(key, 'cancelled', '子代理已中止')
        else markTerminal(key, 'failed', '子代理结束: ' + (stop || 'unknown'))
      } catch (e) { console.error('[progress-hud] subagent/end:', e && e.message) }
    })

    ctx.on('goal/changed', (payload) => {
      try {
        if (!isPlainObject(payload) || !isPlainObject(payload.change)) return
        const change = payload.change
        const goal = isPlainObject(change.goal) ? change.goal : null
        const idPart = (goal && goal.id !== undefined && goal.id !== null) ? goal.id : (isPlainObject(change.ref) ? change.ref.id : 'unknown')
        const key = 'goal:' + String(idPart)
        if (!goal) { markTerminal(key, 'cancelled', '目标已清除'); return }
        const phase = typeof goal.phase === 'string' ? goal.phase : 'active'
        const total = clampNum(goal.maxGoalRounds)
        const current = clampNum(goal.roundsStarted)
        const status = phase === 'complete' ? 'completed' : phase === 'blocked' ? 'failed' : (phase === 'paused' ? 'paused' : 'running')
        upsertTask(key, {
          kind: 'goal',
          label: truncate(goal.objective || '长期目标', 70),
          detail: '目标轮次 ' + (current === null ? 0 : current) + ' / ' + (total === null ? '?' : total) + (phase !== 'active' ? (' · ' + phase) : ''),
          current, total, status,
          endedAt: status === 'completed' ? Date.now() : null,
        })
      } catch (e) { console.error('[progress-hud] goal/changed:', e && e.message) }
    })

    const jobsSvc = ctx.get('jobs')
    if (jobsSvc && typeof jobsSvc.onJobsChanged === 'function' && typeof jobsSvc.list === 'function') {
      ctx.effect(() => jobsSvc.onJobsChanged(() => { try { syncJobs() } catch (e) { console.error('[progress-hud] jobs sync:', e && e.message) } }), 'progress-hud: jobs watcher')
      syncJobs()
    }
    function syncJobs() {
      let list = null
      try { list = jobsSvc.list() } catch (e) { return }
      if (!Array.isArray(list)) return
      for (const j of list) {
        if (!isPlainObject(j)) continue
        const key = 'job:' + String(j.id)
        const status = typeof j.status === 'string' ? j.status : ''
        const base = {
          kind: 'job',
          label: truncate(j.label || j.kind || '后台任务', 70),
          startedAt: typeof j.startedAt === 'number' ? j.startedAt : undefined,
        }
        if (status === 'running' || status === 'stopping') {
          upsertTask(key, Object.assign(base, {
            detail: (typeof j.detail === 'string' && j.detail) ? truncate(j.detail, 90) : '后台任务运行中',
            status: 'running', endedAt: null,
          }))
        } else if (status === 'completed') {
          if (tasks.has(key)) markTerminal(key, 'completed', (typeof j.detail === 'string' && j.detail) ? truncate(j.detail, 90) : '后台任务完成')
        } else if (status === 'killed' || status === 'failed') {
          if (tasks.has(key)) markTerminal(key, status === 'killed' ? 'cancelled' : 'failed', (typeof j.detail === 'string' && j.detail) ? truncate(j.detail, 90) : ('后台任务结束: ' + status))
        }
      }
    }

    function buildSnapshot() {
      const now = Date.now()
      sweep(now)
      const out = []
      for (const t of tasks.values()) {
        out.push({
          key: t.key, kind: t.kind, label: t.label, detail: t.detail, status: t.status,
          current: t.current, total: t.total,
          startedAt: t.startedAt, endedAt: t.endedAt, seq: t.seq,
          items: Array.isArray(t.items) ? t.items : null,
        })
      }
      out.sort((a, b) => a.seq - b.seq)
      const tools = []
      for (const entry of activeTools) {
        const info = entry[1]
        if (now - info.startedAt >= LONG_TOOL_MS) {
          tools.push({ key: 'tool:' + entry[0], name: info.name, summary: info.summary, startedAt: info.startedAt })
        }
      }
      return { now, tasks: out, tools }
    }

    function startDemo(args) {
      const mode = isPlainObject(args) && args.mode === 'agent' ? 'agent' : 'quant'
      const key = 'demo:' + Date.now() + ':' + Math.floor(Math.random() * 1000)
      if (mode === 'agent') {
        upsertTask(key, { kind: 'subagent', label: '演示 · 后台代理', detail: '正在执行子任务…' })
        own(ctx.timeout(() => { markTerminal(key, 'completed', '演示完成') }, 9000))
      } else {
        upsertTask(key, { kind: 'manual', label: '演示 · 量化任务', detail: '准备中…', current: 0, total: 24 })
        const h = own(ctx.interval(() => {
          const t = tasks.get(key)
          if (!t) { h(); return }
          t.current = Math.min((t.current || 0) + 1, t.total || 24)
          t.detail = '执行第 ' + t.current + ' / ' + (t.total || 24) + ' 步'
          if (t.total !== null && t.current >= t.total) { markTerminal(key, 'completed', '演示完成'); h() }
        }, 350))
      }
      return { ok: true, mode }
    }

    own(ctx.interval(() => { try { sweep(Date.now()) } catch (e) {} }, 30000))

    own(harness.handle('progress-hud.snapshot', () => {
      try { return buildSnapshot() } catch (e) { return { now: Date.now(), tasks: [], tools: [] } }
    }))
    own(harness.handle('progress-hud.demo', (args) => {
      try { return startDemo(args) } catch (e) { return { ok: false, error: String(e && e.message || e) } }
    }))

    const toolDef = harness.defineTool({
      name: 'task_progress',
      description: '向用户报告可量化任务的进度，界面右下角会浮现对应的进度条。当你正在执行多步骤、批处理、长等待且能量化的工作时调用：start 声明任务名与总量 total；执行中用 update 汇报 current 与当前步骤 message；完成用 finish；失败用 fail。同一任务复用同一 key。',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['start', 'update', 'finish', 'fail'], description: 'start=创建任务, update=汇报进度, finish=完成, fail=标记失败' },
          key: { type: 'string', description: '任务唯一标识（同一任务保持一致）' },
          label: { type: 'string', description: '任务名称（start 时必填）' },
          message: { type: 'string', description: '当前步骤描述' },
          current: { type: 'number', description: '已完成数量' },
          total: { type: 'number', description: '总量（start 声明，update 可修正）' },
        },
        required: ['action'],
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: (args, value) => {
          const ok = isPlainObject(value) && value.ok === true
          if (ok) return [{ type: 'text', text: '进度已上报: ' + String(value.key) + ' → ' + String(value.status) }]
          return [{ type: 'text', text: '进度上报失败: ' + (isPlainObject(value) ? String(value.error || '未知原因') : '未知原因') }]
        },
      },
      isConcurrencySafe: () => true,
      execute: async (args) => {
        const a = isPlainObject(args) ? args : {}
        const action = typeof a.action === 'string' ? a.action : ''
        const rawKey = typeof a.key === 'string' && a.key.trim() ? a.key.trim() : ''
        const key = 'manual:' + (rawKey || ('task-' + Date.now()))
        if (action === 'start') {
          const label = truncate(a.label, 70)
          if (!label) return { ok: false, error: 'start 需要 label' }
          const t = upsertTask(key, {
            kind: 'manual', label,
            detail: truncate(a.message, 90),
            total: clampNum(a.total),
            current: clampNum(a.current) === null ? 0 : clampNum(a.current),
            status: 'running', startedAt: Date.now(), endedAt: null,
          })
          return { ok: true, key, status: t.status }
        }
        let t = tasks.get(key)
        if (!t) {
          if (action === 'finish' || action === 'fail') return { ok: false, error: '任务不存在: ' + key }
          t = upsertTask(key, { kind: 'manual', label: truncate(a.label || rawKey || '任务', 70), total: clampNum(a.total), current: 0 })
        }
        if (action === 'update') {
          if (typeof a.label === 'string' && a.label) t.label = truncate(a.label, 70)
          if (typeof a.message === 'string') t.detail = truncate(a.message, 90)
          if (a.total !== undefined) t.total = clampNum(a.total)
          if (a.current !== undefined) t.current = clampNum(a.current)
          if (t.total !== null && t.current !== null && t.current >= t.total && t.status === 'running') { t.status = 'completed'; t.endedAt = Date.now() }
          return { ok: true, key, status: t.status }
        }
        if (action === 'finish') {
          if (t.total !== null) t.current = t.total
          if (typeof a.message === 'string') t.detail = truncate(a.message, 90)
          t.status = 'completed'; t.endedAt = Date.now()
          return { ok: true, key, status: 'completed' }
        }
        if (action === 'fail') {
          if (typeof a.message === 'string') t.detail = truncate(a.message, 90)
          t.status = 'failed'; t.endedAt = Date.now()
          return { ok: true, key, status: 'failed' }
        }
        return { ok: false, error: '未知 action: ' + action }
      },
    })
    own(harness.registerTool(ctx, toolDef))
    console.log('[progress-hud] host half ready')
  },
}
