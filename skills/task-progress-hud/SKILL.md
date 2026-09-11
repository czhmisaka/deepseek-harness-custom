---
name: task-progress-hud
description: DSH 右下角自动浮现的任务进度条 HUD。当执行可量化进度的任务（批处理、多步骤、长等待）时用 task_progress 工具上报进度，界面实时显示进度条；同时自动跟踪 todo 清单、workflow、subagent、后台作业与超 4 秒的工具调用。触发词：进度条、任务进度、进度展示、上报进度、演示进度、进度 HUD。
---

# 任务进度条 HUD（task-progress-hud）

一个已部署的动态 Cordis 插件（pluginId `prog-1`）在 DSH Web 界面右下角提供浮动进度面板：
无任务时完全隐藏，出现可量化任务时自动浮现、实时推进、完成变绿 6 秒后淡出。

## 日常怎么用（最重要）

### 1. 用 task_progress 工具主动上报量化进度

只要正在做**多步骤 / 批处理 / 长等待**且能给得出数量的工作，就上报：

| 动作 | 时机 | 必填 |
|---|---|---|
| `start` | 任务开始 | `key` + `label`，建议同时给 `total` |
| `update` | 每完成一批/一步 | `key` + `current`，最好带 `message`（当前步骤说明） |
| `finish` | 完成 | `key`，可带收尾 `message` |
| `fail` | 失败中止 | `key` + `message`（原因） |

```json
// 典型序列（同一任务复用同一 key）
{"action":"start","key":"kemen-detect","label":"检测帧处理","total":1080,"message":"开始检测"}
{"action":"update","key":"kemen-detect","current":240,"message":"已完成 240/1080 帧"}
{"action":"finish","key":"kemen-detect","message":"全部帧处理完成"}
```

要点：
- `key` 用稳定英文标识（如 `kemen-detect`、`report-gen`），同一任务从头到尾一致；
- `current/total` 是数字；条上会显示 `240/1080` 与耗时；
- `message` 是条下方的当前步骤说明，写"正在做什么"而不是重复数字；
- total 可在 update 时修正（发现工作量变了就更新）；
- current ≥ total 时条自动完成，无需再 finish。

**不该用**：单步小操作、几秒内完成的琐事——那是噪音。

### 2. 自动跟踪的信号（不用你做任何事）

| 信号 | HUD 表现 | 对 agent 的含义 |
|---|---|---|
| `todo_write` | ☰ 任务清单 x/y 进度条，点行展开每项 ✓/▸/○ | todo 状态会被实时渲染，**保持 todo 状态准确就是在维护进度条** |
| `workflow` 工具 | ⚙ 子代理完成数 + 当前阶段名 | 用 phase()/label() 让进度更有信息量 |
| `subagent` / `subagent_fork` | ◈ 任务描述（取自 description 参数）+ 计时 | description 写清楚，HUD 就能看懂 |
| 后台作业（bash run_in_background 等） | ▤ 标签 + 转圈计时 | 长命令尽量走后台作业，会显示 |
| 任何工具调用 > 4 秒 | 工具名 + 参数摘要的转圈行 | 快工具不显示，无噪音 |

### 3. 演示

用户说"演示一下进度条 / 测试效果"时：跑一遍 task_progress start→update×n→finish，
配一个 `sleep 6` 的前台命令（触发长工具行）和一个后台作业，最后收尾即可。

## 重建 / 排障

动态插件是**会话级**的：DSH 进程重启后插件消失。判断与恢复：

1. 看工具列表里有没有 `task_progress`（cordis_inspect_query Tool.listTools），没有就是没在运行；
2. 按"重新部署"一节用 `cordis_define`（kind: new, idPrefix `prog`）+ `cordis_run` 重建；
3. 首次激活 client 半需要用户在会话卡片点 ✓ 授权；
4. 修插件走"同 Plugin 追加新 Package"，不要新建同名插件。

### 两个 schema 铁律（defineTool 会当场炸）

- `output.schema` 的对象**必须显式** `additionalProperties: true`（省略报 "must be explicitly true or false"）；
- `parameters` 根对象**不能写** `additionalProperties: false`（报 "must be true or omitted because the implicit parameter root is open"），省略或 true。

### 可调参数（在 host 代码顶部常量）

- `LONG_TOOL_MS = 4000`：工具调用超过多少毫秒显示转圈行；
- `TERMINAL_VISIBLE_MS`（client）/ `TERMINAL_TTL_MS`（host）：完成后停留 6 秒 / 2 分钟清理；
- HUD 位置：client CSS `.ph-hud { right: 16px; bottom: 148px; width: 330px; }`；
- 轮询间隔 `POLL_MS = 700`。

## 重新部署（完整源码）

步骤：`cordis_define`（plugin.kind=new, idPrefix `prog`，code.host/code.client 用下面两段）
→ `cordis_run`（mode: run）→ 若返回 awaiting-approval 让用户点批准。

### code.host

```js
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
```

### code.client

```js
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
```
