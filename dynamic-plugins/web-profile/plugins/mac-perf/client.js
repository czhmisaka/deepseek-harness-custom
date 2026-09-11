/**
 * Mac 性能看板 — browser half（由动态插件 perf-1/pkg-4 固化而来）。
 * 铁律：CJS + __ModuleLoader__.load wrapper；React 走平台模块表 require。
 * 数据通道：host.call('perf-snapshot') 换成同源 fetch('/mac-perf/snapshot')。
 * @module dsh-mac-perf/client
 */
window.__ModuleLoader__.load({
  id: 'dsh-mac-perf',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    const React = require('react');

    const name = 'mac-perf'
    const inject = ['timer']

    function apply(ctx) {
    const el = React.createElement
    const delay = (fn, ms) => ctx.timeout(fn, ms)

    const CSS_TEXT = [
      '.mp-root{display:flex;flex-direction:column;gap:12px;padding:2px 2px 20px;color:var(--dsw-alias-label-primary);font-size:12.5px;line-height:1.45;height:100%;min-height:0;overflow-y:auto;box-sizing:border-box;}',
      '.mp-head{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;color:var(--dsw-alias-label-secondary);align-items:baseline;}',
      '.mp-head b{color:var(--dsw-alias-label-primary);font-weight:600;}',
      '.mp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;}',
      '.mp-charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:10px;}',
      '.mp-tables{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:10px;}',
      '.mp-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:10px 12px 11px;min-width:0;overflow:hidden;}',
      '.mp-card-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px;}',
      '.mp-title{font-size:11px;letter-spacing:.05em;color:var(--dsw-alias-label-secondary);}',
      '.mp-val{font-size:20px;font-weight:700;font-variant-numeric:tabular-nums;}',
      '.mp-val.ok{color:var(--dsw-alias-label-primary);}',
      '.mp-val.warn{color:var(--dsw-alias-state-warn-primary);}',
      '.mp-val.err{color:var(--dsw-alias-state-error-primary);}',
      '.mp-bar{height:4px;border-radius:2px;background:var(--dsw-alias-border-l1);overflow:hidden;margin:6px 0 2px;}',
      '.mp-bar i{display:block;height:100%;border-radius:2px;background:var(--dsw-alias-state-success-primary);}',
      '.mp-bar i.warn{background:var(--dsw-alias-state-warn-primary);}',
      '.mp-bar i.err{background:var(--dsw-alias-state-error-primary);}',
      '.mp-rows{display:flex;flex-direction:column;gap:2px;font-variant-numeric:tabular-nums;margin-top:6px;}',
      '.mp-row{display:flex;justify-content:space-between;gap:10px;color:var(--dsw-alias-label-secondary);min-width:0;}',
      '.mp-row b{color:var(--dsw-alias-label-primary);font-weight:500;white-space:nowrap;}',
      '.mp-chart-wrap{height:56px;margin:2px 0;}',
      '.mp-chart-wrap.tall{height:76px;}',
      '.mp-svg{width:100%;height:100%;display:block;}',
      '.mp-net-legend{display:flex;gap:12px;font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;}',
      '.mp-dot{display:inline-block;width:8px;height:8px;border-radius:4px;margin-right:4px;}',
      '.mp-table{width:100%;border-collapse:collapse;font-size:11.5px;table-layout:fixed;}',
      '.mp-table td{padding:2.5px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.mp-table td.num{text-align:right;font-variant-numeric:tabular-nums;width:72px;color:var(--dsw-alias-label-secondary);}',
      '.mp-table td.num.wide{width:170px;}',
      '.mp-err{border:1px solid var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);border-radius:8px;padding:8px 12px;font-size:12px;}',
      '.mp-empty{color:var(--dsw-alias-label-secondary);text-align:center;padding:14px 0;font-size:11.5px;}',
    ].join('\n')
    ctx.effect(() => {
      // styles.insert 是动态插件闭包参数，静态 bundle 用自带清理的 style 标签
      const tag = document.createElement('style')
      tag.setAttribute('data-mac-perf', 'css')
      tag.textContent = CSS_TEXT
      document.head.appendChild(tag)
      return () => tag.remove()
    }, 'mac-perf: css')

    const fmtBytes = (b) => {
      if (b === null || b === undefined || !isFinite(b)) return '—'
      const u = ['B', 'KB', 'MB', 'GB', 'TB']
      let i = 0
      let v = b
      while (v >= 1024 && i < u.length - 1) { v /= 1024; i++ }
      return (v >= 100 || i === 0 ? String(Math.round(v)) : v.toFixed(1)) + ' ' + u[i]
    }
    const fmtRate = (bps) => (bps === null || bps === undefined || !isFinite(bps)) ? '—' : fmtBytes(bps) + '/s'
    const fmtUptime = (sec) => {
      if (sec === null || sec === undefined) return '—'
      const d = Math.floor(sec / 86400)
      const h = Math.floor((sec % 86400) / 3600)
      const m = Math.floor((sec % 3600) / 60)
      return (d ? d + '天' : '') + (h || d ? h + '小时' : '') + m + '分'
    }
    const f0 = (v) => (v === null || v === undefined) ? '—' : v.toFixed(0)
    const f1 = (v) => (v === null || v === undefined) ? '—' : v.toFixed(1)
    const tone = (pct) => pct >= 90 ? 'err' : pct >= 70 ? 'warn' : 'ok'
    const prep = (vals) => {
      let i = 0
      while (i < vals.length && (vals[i] === null || vals[i] === undefined)) i++
      const out = []
      for (let j = i; j < vals.length; j++) out.push(vals[j] === null || vals[j] === undefined ? 0 : vals[j])
      return out
    }

    function Spark(p) {
      const vals = p.vals || []
      const h = p.height || 56
      const color = p.color || 'var(--dsw-alias-brand-primary)'
      if (vals.length < 2) return el('div', { className: 'mp-empty' }, '采集中…')
      const w = 100
      let mx = p.max
      if (!mx) { mx = 0.001; for (let i = 0; i < vals.length; i++) if (vals[i] > mx) mx = vals[i] }
      const step = w / (vals.length - 1)
      let d = ''
      for (let i = 0; i < vals.length; i++) {
        const x = (i * step).toFixed(2)
        const y = (h - 2 - Math.max(0, Math.min(1, vals[i] / mx)) * (h - 4)).toFixed(2)
        d += (i ? ' L' : 'M') + x + ',' + y
      }
      return el('svg', { className: 'mp-svg', viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'none' },
        el('path', { d: d + ' L' + w + ',' + h + ' L0,' + h + ' Z', fill: color, opacity: 0.13 }),
        el('path', { d: d, fill: 'none', stroke: color, strokeWidth: 1.4, vectorEffect: 'non-scaling-stroke' }))
    }

    function DualSpark(p) {
      const a = p.a || []
      const b = p.b || []
      const h = p.height || 72
      if (Math.max(a.length, b.length) < 2) return el('div', { className: 'mp-empty' }, '采集中…')
      const w = 100
      const all = a.concat(b)
      let mx = p.max || 0.001
      for (let i = 0; i < all.length; i++) if (all[i] > mx) mx = all[i]
      const mk = (vals, color) => {
        const step = w / Math.max(1, vals.length - 1)
        let d = ''
        for (let i = 0; i < vals.length; i++) {
          const y = (h - 2 - Math.max(0, Math.min(1, vals[i] / mx)) * (h - 4)).toFixed(2)
          d += (i ? ' L' : 'M') + (i * step).toFixed(2) + ',' + y
        }
        return [
          el('path', { d: d + ' L' + w + ',' + h + ' L0,' + h + ' Z', fill: color, opacity: 0.10 }),
          el('path', { d: d, fill: 'none', stroke: color, strokeWidth: 1.4, vectorEffect: 'non-scaling-stroke' }),
        ]
      }
      return el('svg', { className: 'mp-svg', viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'none' },
        mk(b, p.colorB || 'var(--dsw-alias-state-warn-primary)'),
        mk(a, p.colorA || 'var(--dsw-alias-state-success-primary)'))
    }

    function Card(p) {
      const bar = (p.pct === null || p.pct === undefined) ? null :
        el('div', { className: 'mp-bar' }, el('i', { className: tone(p.pct), style: { width: Math.max(2, Math.min(100, p.pct)) + '%' } }))
      return el('div', { className: 'mp-card' },
        el('div', { className: 'mp-card-head' },
          el('span', { className: 'mp-title' }, p.title),
          (p.value === null || p.value === undefined) ? null : el('span', { className: 'mp-val ' + tone(p.pct || 0) }, p.value)),
        bar,
        p.chart || null,
        p.rows ? el('div', { className: 'mp-rows' }, p.rows.map((r, i) => el('div', { className: 'mp-row', key: i }, el('span', null, r[0]), el('b', null, r[1])))) : null)
    }

    function ChartCard(p) {
      return el('div', { className: 'mp-card' },
        el('div', { className: 'mp-card-head' },
          el('span', { className: 'mp-title' }, p.title),
          p.legend || null),
        p.chart || null)
    }

    function ProcTable(p) {
      const rows = p.rows || []
      let mx = 1
      for (let i = 0; i < rows.length; i++) if (rows[i].v > mx) mx = rows[i].v
      const children = []
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        const w = Math.max(1, r.v / mx * 100).toFixed(0)
        children.push(el('tr', { key: i },
          el('td', { style: { background: 'linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent) ' + w + '%, transparent ' + w + '%)' } }, r.name),
          el('td', { className: 'num' }, r.text)))
      }
      return el('div', { className: 'mp-card' },
        el('div', { className: 'mp-card-head' }, el('span', { className: 'mp-title' }, p.title)),
        children.length ? el('table', { className: 'mp-table' }, el('tbody', null, children)) : el('div', { className: 'mp-empty' }, '采集中…'))
    }

    function RowsTable(p) {
      const rows = p.rows || []
      const children = []
      for (let i = 0; i < rows.length; i++) children.push(el('tr', { key: i }, el('td', null, rows[i][0]), el('td', { className: p.wide ? 'num wide' : 'num' }, rows[i][1])))
      return el('div', { className: 'mp-card' },
        el('div', { className: 'mp-card-head' }, el('span', { className: 'mp-title' }, p.title)),
        children.length ? el('table', { className: 'mp-table' }, el('tbody', null, children)) : el('div', { className: 'mp-empty' }, '采集中…'))
    }

    const memPctOrNull = (cur, tk) => {
      if (cur.memPct !== null && cur.memPct !== undefined) return cur.memPct.toFixed(0) + '%'
      if (tk.freePct !== null && tk.freePct !== undefined) return String(100 - tk.freePct)
      return '—'
    }

    function Dashboard() {
      const snapState = React.useState(null)
      const data = snapState[0]
      const setData = snapState[1]
      const errState = React.useState(null)
      const err = errState[0]
      const setErr = errState[1]
      React.useEffect(() => {
        let dead = false
        let t = null
        const loop = async () => {
          try {
            const resp = await fetch('/mac-perf/snapshot', { cache: 'no-store' })
            if (!resp.ok) throw new Error('HTTP ' + resp.status)
            const s = await resp.json()
            if (!dead) { setData(s); setErr(null) }
          } catch (e) {
            if (!dead) setErr(String((e && e.message) || e))
          }
          if (!dead) {
            let wait = 2000
            try { if (typeof document !== 'undefined' && document.hidden) wait = 8000 } catch (e) {}
            t = delay(loop, wait)
          }
        }
        loop()
        return () => { dead = true; if (t) t() }
      }, [])

      if (!data) return el('div', { className: 'mp-root' }, el('div', { className: 'mp-empty' }, '正在采集第一份快照…'))
      const meta = data.meta || {}
      const tk = data.tick || {}
      const cur = data.latest || {}
      const hist = data.history || []
      const now = Date.now()
      const age = data.now ? Math.max(0, Math.round((now - data.now) / 1000)) : null

      const cpuVals = []
      for (let i = 0; i < hist.length; i++) cpuVals.push(Math.min(100, (hist[i].cu || 0) + (hist[i].cs || 0)))
      const fillSeq = (get) => { const out = []; let last = null; for (let i = 0; i < hist.length; i++) { const v = get(hist[i]); if (v !== null && v !== undefined) last = v; out.push(last) } return out }
      const memVals = fillSeq(p => p.memPct)
      const rxVals = fillSeq(p => p.rxBps)
      const txVals = fillSeq(p => p.txBps)
      const ioVals = fillSeq(p => p.ioBps)

      const cpuBusy = (cur.ci !== null && cur.ci !== undefined) ? Math.max(0, Math.min(100, 100 - cur.ci)) : Math.min(100, (cur.cu || 0) + (cur.cs || 0))
      const memTotal = meta.memTotal
      const df = meta.df
      const batt = meta.batt
      const swap = meta.swap
      const upSec = meta.bootSec ? Math.max(0, Math.floor((now - meta.bootSec * 1000) / 1000)) : null

      const cpuRows = [
        ['用户 / 系统 / 空闲', f0(cur.cu) + '% / ' + f0(cur.cs) + '% / ' + f0(cur.ci) + '%'],
        ['负载 1 / 5 / 15 分钟', (cur.l1 !== null && cur.l1 !== undefined) ? f1(cur.l1) + ' · ' + f1(cur.l5) + ' · ' + f1(cur.l15) : '—'],
        ['进程 / 线程', (cur.procs !== null && cur.procs !== undefined ? cur.procs + (cur.procsRun ? '（运行 ' + cur.procsRun + '）' : '') : '—') + ' / ' + ((cur.threads !== null && cur.threads !== undefined) ? cur.threads : '—')],
      ]
      const usedB = (memTotal && cur.mUnused !== null && cur.mUnused !== undefined) ? memTotal - cur.mUnused
        : (tk.usedB !== null && tk.usedB !== undefined ? tk.usedB
          : ((memTotal && tk.freeB !== null && tk.freeB !== undefined) ? memTotal - tk.freeB : null))
      const memRows = [
        ['已用 / 总量', (usedB !== null ? fmtBytes(usedB) : '—') + ' / ' + (memTotal ? fmtBytes(memTotal) : '—')],
        ['压缩内存', fmtBytes(cur.mComp !== null && cur.mComp !== undefined ? cur.mComp : tk.compB)],
        ['固定（wired）', fmtBytes(cur.mWired !== null && cur.mWired !== undefined ? cur.mWired : tk.wiredB)],
        ['空闲（unused）', fmtBytes(cur.mUnused)],
        ['内存压力', tk.freePct !== null && tk.freePct !== undefined ? (100 - tk.freePct).toFixed(0) + '%' : '—'],
        ['Swap 累计 in / out', (cur.si !== null && cur.si !== undefined) ? cur.si + ' / ' + cur.so : ((tk.swapin !== null && tk.swapin !== undefined) ? tk.swapin + ' / ' + tk.swapout : '—')],
      ]
      const ioRows = [
        ['容量使用', df ? df.cap + '%' : '—'],
        ['已用 / 总量', df ? fmtBytes(df.usedKB * 1024) + ' / ' + fmtBytes(df.totalKB * 1024) : '—'],
        ['可用空间', df ? fmtBytes(df.availKB * 1024) : '—'],
        ['读写速率', fmtRate(cur.ioBps !== null && cur.ioBps !== undefined ? cur.ioBps : tk.ioBps)],
        ['IOPS', cur.tps !== null && cur.tps !== undefined ? String(Math.round(cur.tps)) : ((tk.tps !== null && tk.tps !== undefined) ? String(Math.round(tk.tps)) : '—')],
      ]
      const battRows = [
        ['状态', batt ? batt.status + (batt.ac ? '（外接电源）' : '') : '—'],
        ['剩余时间', (batt && batt.remaining) ? batt.remaining : '—'],
        ['Swap 分区', (swap && swap.total) ? fmtBytes(swap.used) + ' / ' + fmtBytes(swap.total) : '无'],
      ]

      const cpuProcs = []
      const psCpu = tk.psCpu || []
      for (let i = 0; i < psCpu.length; i++) {
        const r = psCpu[i]
        cpuProcs.push({ name: r.pid + ' · ' + r.name, v: r.cpu, text: r.cpu.toFixed(1) + '%' })
      }
      const memProcs = []
      const psMem = tk.psMem || []
      for (let i = 0; i < psMem.length; i++) {
        const r = psMem[i]
        memProcs.push({ name: r.pid + ' · ' + r.name, v: r.rss || 1, text: fmtBytes(r.rss) })
      }
      const svc = meta.svc || {}
      const treePids = new Set((svc.tree || []).map(r => r.pid))
      const portRows = []
      const lst = svc.listeners || []
      for (let i = 0; i < lst.length; i++) {
        const l = lst[i]
        portRows.push([(treePids.has(l.pid) ? '● ' : '') + l.port + ' · ' + l.name, 'PID ' + l.pid])
      }
      const svcTree = svc.tree || []
      const treeRows = []
      for (let i = 0; i < svcTree.length; i++) {
        const r = svcTree[i]
        const portTag = (r.ports && r.ports.length) ? ':' + r.ports.join(' :') + ' ' : ''
        treeRows.push([portTag + r.pid + ' · ' + r.cmd, r.etime + ' · ' + fmtBytes(r.rss)])
      }

      const legendNet = el('span', { className: 'mp-net-legend' },
        el('span', null, el('i', { className: 'mp-dot', style: { background: 'var(--dsw-alias-state-success-primary)' } }), '↓ ' + fmtRate(cur.rxBps !== null && cur.rxBps !== undefined ? cur.rxBps : tk.rxBps)),
        el('span', null, el('i', { className: 'mp-dot', style: { background: 'var(--dsw-alias-state-warn-primary)' } }), '↑ ' + fmtRate(cur.txBps !== null && cur.txBps !== undefined ? cur.txBps : tk.txBps)))

      const head = el('div', { className: 'mp-head' },
        el('b', null, (meta.chip || 'Mac') + (meta.model ? ' · ' + meta.model : '')),
        meta.hostname ? el('span', null, meta.hostname) : null,
        meta.ip ? el('span', null, meta.ip + ' @ ' + (meta.iface || '?')) : null,
        upSec !== null ? el('span', null, '已运行 ' + fmtUptime(upSec)) : null,
        el('span', null, '采样 2s · 更新于 ' + (age === null ? '—' : age + 's 前')))

      return el('div', { className: 'mp-root' },
        err ? el('div', { className: 'mp-err', key: 'err' }, '采集失败：' + err) : null,
        el('div', { key: 'head' }, head),
        el('div', { className: 'mp-grid', key: 'cards' },
          Card({ title: 'CPU', value: f0(cpuBusy) + '%', pct: cpuBusy, chart: Spark({ vals: cpuVals, max: 100 }), rows: cpuRows }),
          Card({ title: '内存', value: memPctOrNull(cur, tk), pct: (cur.memPct !== null && cur.memPct !== undefined) ? cur.memPct : ((tk.freePct !== null && tk.freePct !== undefined) ? 100 - tk.freePct : null), chart: Spark({ vals: prep(memVals), max: 100 }), rows: memRows }),
          Card({ title: '磁盘', value: df ? df.cap + '%' : '—', pct: df ? df.cap : null, chart: Spark({ vals: prep(ioVals).map(v => v / 1048576) }), rows: ioRows }),
          Card({ title: '电池', value: (batt && batt.percent !== null && batt.percent !== undefined) ? batt.percent + '%' : '—', pct: batt ? batt.percent : null, rows: battRows })),
        el('div', { className: 'mp-charts', key: 'net' },
          ChartCard({ title: '网络吞吐（绿=接收 / 橙=发送）', legend: legendNet, chart: el('div', { className: 'mp-chart-wrap tall' }, DualSpark({ a: prep(rxVals), b: prep(txVals) })) })),
        el('div', { className: 'mp-tables', key: 'tables' },
          ProcTable({ title: 'Top 进程 · CPU', rows: cpuProcs }),
          ProcTable({ title: 'Top 进程 · 内存', rows: memProcs })),
        el('div', { className: 'mp-tables', key: 'svc' },
          RowsTable({ title: '服务 · 监听端口（● = dsh 会话派生）', rows: portRows }),
          RowsTable({ title: 'dsh 会话派生进程（含后台任务/服务脚本）', rows: treeRows, wide: true })))
    }

    const slots = ctx.get('slots')
    if (slots === undefined) {
      console.error('mac-perf: slots service unavailable')
      return
    }
    slots.inject('conversation.view', () => slots.register(
      { name: 'conversation.view', id: 'mac-perf', order: 30, label: '性能看板' },
      () => Dashboard()))
}

    module.exports = { name: name, inject: inject, apply: apply };
    return module.exports;
  }
});
