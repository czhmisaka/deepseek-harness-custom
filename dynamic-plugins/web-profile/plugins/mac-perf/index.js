/**
 * Mac 性能看板 — host half（由动态插件 perf-1/pkg-4 固化而来）。
 * 数据通道：动态插件的 harness.handle/host.call 换成 webServer 路由
 * GET /mac-perf/snapshot（同源 + connection 鉴权），其余采集逻辑不变。
 * @module dsh-mac-perf
 */

export const name = 'mac-perf'

/** Host services: shell 采集、timer 心跳、webServer 快照路由。 */
export const inject = ['shell', 'timer', 'webServer']

/**
 * Start the top/iostat streams, the 3s tick, and the snapshot route.
 * @param {import('@deepseek-ai/cordis').Context} ctx - cordis plugin context.
 */
export function apply(ctx) {
    const shell = ctx.shell
    if (shell === undefined) {
      console.error('mac-perf: shell service unavailable')
      return
    }
    let topProc = null
    let ioProc = null
    const state = {
      history: [], buf: '', iobuf: '', lastTop: null, lastNet: null, pendingIo: null,
      lastTick: null, lastIo: null, lastRequestTs: 0, startedTs: Date.now(), tickCount: 0, tickBusy: false,
      iface: 'en0', ip: null, df: null, batt: null, swap: null, svc: null,
      hw: { brand: null, model: null, hostname: null, memsize: null, ncpu: null, bootSec: null },
      streamOk: false, ioOk: false,
    }
    // 静态插件跑在 dsh 进程内：会话派生服务 = 本进程的整棵子树
    const DSH_PID = (typeof process !== 'undefined' && process.pid) || 0
    const MULT = { '': 1, K: 1024, M: 1048576, G: 1073741824, T: 1099511627776, P: 1125899906842624 }
    const parseBytes = (s) => {
      if (s === null || s === undefined) return null
      const m = /^([\d.]+)\s*([KMGTP]?)/.exec(String(s).trim())
      if (!m) return null
      return parseFloat(m[1]) * (MULT[m[2]] || 1)
    }
    let loggedSandbox = false
    const runSh = async (cmd, timeoutMs) => {
      const spec = shell.resolve({ command: cmd, timeoutMs: timeoutMs || 15000, stdoutMaxBytes: 300000, sandboxPolicy: PERF_POLICY })
      const r = await shell.run(spec)
      if (!loggedSandbox && r) {
        loggedSandbox = true
        console.error('mac-perf: sandbox=' + (r.sandbox ? r.sandbox.mode + '/denied=' + r.sandbox.denied : 'none') + ' exit=' + r.exitCode)
      }
      if (!r || r.exitCode !== 0) return null
      return r.stdout ? r.stdout.text : null
    }
    const active = () => (Date.now() - state.lastRequestTs < 90000) || (Date.now() - state.startedTs < 45000)
    const PERF_POLICY = { mode: 'danger-full-access', workspaceRoot: '/tmp' }

    const parseSample = (chunk) => {
      if (chunk.indexOf('CPU usage') < 0) return
      const cpu = /^CPU usage:\s*([\d.]+)%\s*user,\s*([\d.]+)%\s*sys,\s*([\d.]+)%\s*idle/m.exec(chunk)
      if (!cpu) return
      const now = Date.now()
      const p = {
        t: now,
        cu: parseFloat(cpu[1]), cs: parseFloat(cpu[2]), ci: parseFloat(cpu[3]),
        l1: null, l5: null, l15: null, procs: null, procsRun: null, threads: null,
        mUsed: null, mWired: null, mComp: null, mUnused: null, memPct: null,
        si: null, so: null, netIn: null, netOut: null, rxBps: null, txBps: null,
        ioBps: null, tps: null,
      }
      const proc = /^Processes:\s*(\d+)\s*total,\s*(\d+)\s*running[\s\S]*?(\d+)\s*threads/m.exec(chunk)
      if (proc) { p.procs = parseInt(proc[1], 10); p.procsRun = parseInt(proc[2], 10); p.threads = parseInt(proc[3], 10) }
      const load = /^Load Avg:\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/m.exec(chunk)
      if (load) { p.l1 = parseFloat(load[1]); p.l5 = parseFloat(load[2]); p.l15 = parseFloat(load[3]) }
      const mem = /^PhysMem:\s*([\d.]+[KMGT]?)\s*used\s*\(\s*([\d.]+[KMGT]?)\s*wired,\s*([\d.]+[KMGT]?)\s*compressor\s*\),\s*([\d.]+[KMGT]?)\s*unused/m.exec(chunk)
      if (mem) {
        p.mUsed = parseBytes(mem[1]); p.mWired = parseBytes(mem[2]); p.mComp = parseBytes(mem[3]); p.mUnused = parseBytes(mem[4])
        if (state.hw.memsize && p.mUnused !== null) p.memPct = Math.max(0, Math.min(100, (1 - p.mUnused / state.hw.memsize) * 100))
      }
      const vm = /(\d+)\(\d+\)\s*swapins,\s*(\d+)\(\d+\)\s*swapouts/m.exec(chunk)
      if (vm) { p.si = parseInt(vm[1], 10); p.so = parseInt(vm[2], 10) }
      const net = /^Networks:\s*packets:\s*(\d+)\/([\d.]+[KMGT]?)\s*in,\s*(\d+)\/([\d.]+[KMGT]?)\s*out\./m.exec(chunk)
      if (net) {
        p.netIn = parseBytes(net[2]); p.netOut = parseBytes(net[4])
        const prev = state.lastTop
        if (prev && p.netIn !== null && prev.netIn !== null && p.netOut !== null && prev.netOut !== null && p.netIn >= prev.netIn && p.netOut >= prev.netOut) {
          const dt = (p.t - prev.t) / 1000
          if (dt > 0.5 && dt < 12) { p.rxBps = (p.netIn - prev.netIn) / dt; p.txBps = (p.netOut - prev.netOut) / dt }
        }
      }
      state.lastTop = p
      if (state.pendingIo && Math.abs(p.t - state.pendingIo.t) < 6000) {
        p.ioBps = state.pendingIo.ioBps; p.tps = state.pendingIo.tps; state.pendingIo = null
      }
      state.history.push(p)
      if (state.history.length > 240) state.history.splice(0, state.history.length - 240)
      state.streamOk = true
    }
    const drainTop = () => {
      if (!topProc) return
      try { const r = topProc.readOutput(); if (r && r.delta) state.buf += r.delta } catch (e) { return }
      let guard = 0
      let idx = state.buf.indexOf('\n\n')
      while (idx >= 0 && guard < 60) {
        guard++
        const chunk = state.buf.slice(0, idx)
        state.buf = state.buf.slice(idx + 2)
        if (chunk.trim()) parseSample(chunk)
        idx = state.buf.indexOf('\n\n')
      }
      if (state.buf.length > 200000) state.buf = state.buf.slice(-40000)
    }

    let ioReport = null
    let ioReportIdx = -1
    const finalizeIo = () => {
      if (ioReport && ioReport.t && ioReportIdx >= 1) {
        const o = { t: ioReport.t, ioBps: ioReport.mbps * 1048576, tps: ioReport.tps }
        const h = state.history
        if (h.length && Math.abs(h[h.length - 1].t - o.t) < 5000) {
          const p = h[h.length - 1]; p.ioBps = o.ioBps; p.tps = o.tps
        } else {
          state.pendingIo = o
        }
        state.ioOk = true
        state.lastIo = o
        if (state.lastTick) { state.lastTick.ioBps = o.ioBps; state.lastTick.tps = o.tps }
      }
      ioReport = null
    }
    const handleIoLine = (line) => {
      const t = line.trim()
      if (!t) return
      if (t.indexOf('disk') === 0) { finalizeIo(); ioReportIdx++; ioReport = { t: 0, mbps: 0, tps: 0 }; return }
      if (t.indexOf('KB/t') >= 0 || !ioReport) return
      const re = /([\d.]+)\s+(\d+)\s+([\d.]+)/g
      let m = re.exec(t)
      while (m !== null) {
        if (!ioReport.t) ioReport.t = Date.now()
        ioReport.tps += parseFloat(m[2])
        ioReport.mbps += parseFloat(m[3])
        m = re.exec(t)
      }
    }
    const drainIo = () => {
      if (!ioProc) return
      try { const r = ioProc.readOutput(); if (r && r.delta) state.iobuf += r.delta } catch (e) { return }
      let guard = 0
      let idx = state.iobuf.indexOf('\n')
      while (idx >= 0 && guard < 300) {
        guard++
        const line = state.iobuf.slice(0, idx)
        state.iobuf = state.iobuf.slice(idx + 1)
        handleIoLine(line)
        idx = state.iobuf.indexOf('\n')
      }
      if (state.iobuf.length > 100000) state.iobuf = ''
    }

    const FAST_CMD = [
      'echo __VM__',
      '/usr/bin/vm_stat 2>/dev/null | /usr/bin/head -30',
      'echo __MP__',
      "/usr/bin/memory_pressure -Q 2>/dev/null | /usr/bin/grep 'free percentage'",
      'echo __NET__',
      '/usr/sbin/netstat -ib 2>/dev/null',
      'echo __PS1__',
      '/bin/ps -Aceo pid,pcpu,pmem,rss,comm -r 2>/dev/null | /usr/bin/head -11',
      'echo __PS2__',
      '/bin/ps -Aceo pid,pmem,rss,comm -m 2>/dev/null | /usr/bin/head -9',
    ].join('\n')
    const slowCmd = () => [
      'echo __DF__',
      '/bin/df -k /System/Volumes/Data / 2>/dev/null',
      'echo __BATT__',
      '/usr/bin/pmset -g batt 2>/dev/null',
      'echo __SWAP__',
      '/usr/sbin/sysctl -n vm.swapusage 2>/dev/null',
      'echo __IP__',
      '/usr/sbin/ipconfig getifaddr ' + state.iface + ' 2>/dev/null',
      'echo __HOST__',
      '/usr/sbin/sysctl -n kern.boottime kern.hostname machdep.cpu.brand_string hw.memsize hw.ncpu hw.nmodel 2>/dev/null',
      'echo __PORTS__',
      '/usr/sbin/lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | /usr/bin/head -60',
      'echo __PSALL__',
      '/bin/ps -axo pid=,ppid=,pcpu=,pmem=,rss=,etime=,command= 2>/dev/null | /usr/bin/head -500',
    ].join('\n')
    const splitSections = (text) => {
      const out = {}
      const parts = String(text).split(/^__([A-Z0-9]+)__\s*$/m)
      for (let i = 1; i + 1 < parts.length; i += 2) out[parts[i]] = parts[i + 1] || ''
      return out
    }
    const parsePsCpu = (text) => {
      const rows = []
      const lines = String(text || '').split('\n')
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const f = line.split(/\s+/)
        if (f.length < 5) continue
        const cpu = parseFloat(f[1])
        if (!isFinite(cpu)) continue
        rows.push({ pid: parseInt(f[0], 10), cpu: cpu, mem: parseFloat(f[2]), rss: parseInt(f[3], 10) * 1024, name: f.slice(4).join(' ').slice(0, 44) })
      }
      return rows
    }
    const parsePsMem = (text) => {
      const rows = []
      const lines = String(text || '').split('\n')
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const f = line.split(/\s+/)
        if (f.length < 4) continue
        const mem = parseFloat(f[1])
        if (!isFinite(mem)) continue
        rows.push({ pid: parseInt(f[0], 10), mem: mem, rss: parseInt(f[2], 10) * 1024, name: f.slice(3).join(' ').slice(0, 44) })
      }
      return rows
    }
    const parseNetstat = (text) => {
      const lines = String(text || '').split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.indexOf('Name') === 0) continue
        if (line.indexOf(state.iface) !== 0) continue
        const f = line.trim().split(/\s+/)
        if (f.length < 10) continue
        if (f[2].indexOf('<Link') !== 0) continue
        const rx = parseInt(f[6], 10)
        const tx = parseInt(f[9], 10)
        if (isFinite(rx) && isFinite(tx)) return { rx: rx, tx: tx }
      }
      return null
    }
    // 服务视图：监听端口全表 + dsh 进程子树（会话/插件/后台 job 启动的进程）
    const collectServices = (sec) => {
      const listeners = []
      const seenL = new Set()
      const lines = String(sec.PORTS || '').split('\n')
      for (let i = 1; i < lines.length; i++) {
        const m = /^(\S+)\s+(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+TCP\s+([^ ]):(\d+)\s+\(LISTEN\)/.exec(lines[i])
        if (!m) continue
        const pid = parseInt(m[2], 10)
        const port = parseInt(m[4], 10)
        const key = pid + ':' + port
        if (seenL.has(key)) continue
        seenL.add(key)
        listeners.push({ pid: pid, port: port, name: m[1].slice(0, 24) })
      }
      const procs = new Map()
      const plines = String(sec.PSALL || '').split('\n')
      for (let i = 1; i < plines.length; i++) {
        const line = plines[i]
        if (!line) continue
        const f = line.split(/\s+/)
        if (f.length < 7) continue
        const pid = parseInt(f[0], 10)
        const ppid = parseInt(f[1], 10)
        if (!isFinite(pid) || !isFinite(ppid)) continue
        procs.set(pid, { pid: pid, ppid: ppid, cpu: parseFloat(f[2]) || 0, rss: (parseInt(f[4], 10) || 0) * 1024, etime: f[5], cmd: f.slice(6).join(' ').slice(0, 110) })
      }
      const kids = new Map()
      procs.forEach((p, pid) => { if (!kids.has(p.ppid)) kids.set(p.ppid, []); kids.get(p.ppid).push(p.pid) })
      const inTree = new Set()
      if (DSH_PID && procs.has(DSH_PID)) {
        const queue = [DSH_PID]
        inTree.add(DSH_PID)
        while (queue.length && inTree.size < 80) {
          const cur = queue.shift()
          const cs = kids.get(cur) || []
          for (let i = 0; i < cs.length; i++) { if (!inTree.has(cs[i])) { inTree.add(cs[i]); queue.push(cs[i]) } }
        }
      }
      const portsByPid = new Map()
      for (let i = 0; i < listeners.length; i++) {
        const l = listeners[i]
        if (!portsByPid.has(l.pid)) portsByPid.set(l.pid, [])
        portsByPid.get(l.pid).push(l.port)
      }
      const tree = []
      procs.forEach((p) => { if (inTree.has(p.pid)) tree.push(p) })
      tree.sort((a, b) => b.rss - a.rss)
      const svcTree = tree.slice(0, 40).map((p) => ({ pid: p.pid, cpu: p.cpu, rss: p.rss, etime: p.etime, cmd: p.cmd, ports: portsByPid.get(p.pid) || [] }))
      const markTree = new Set(tree.map((p) => p.pid))
      state.svc = { dshPid: DSH_PID, ts: Date.now(), listeners: listeners.slice(0, 40), tree: svcTree, inTree: [...markTree] }
    }
    const parseSlow = (sec) => {
      if (sec.DF) {
        let best = null
        const lines = sec.DF.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const f = lines[i].trim().split(/\s+/)
          if (f.length < 6 || f[0].indexOf('/dev') !== 0) continue
          const rec = { totalKB: parseInt(f[1], 10), usedKB: parseInt(f[2], 10), availKB: parseInt(f[3], 10), cap: parseInt(f[4], 10) }
          if (!isFinite(rec.usedKB)) continue
          if (!best || rec.usedKB > best.usedKB) best = rec
        }
        if (best) state.df = best
      }
      if (sec.BATT) {
        const t = sec.BATT
        const ac = t.indexOf('AC Power') >= 0
        const m = /(\d+)%\s*;\s*([^;\n]+);([^;\n]*)/.exec(t)
        if (m) {
          const rm = /(\d+:\d+)\s*remaining/.exec(t)
          state.batt = { percent: parseInt(m[1], 10), ac: ac, status: m[2].trim(), detail: m[3].replace(/present:\s*true\s*$/, '').trim(), remaining: rm ? rm[1] : null }
        } else if (ac) {
          state.batt = { percent: null, ac: true, status: 'AC Power', detail: '', remaining: null }
        }
      }
      if (sec.SWAP) {
        const t = sec.SWAP
        const tm = /total\s*=\s*([\d.]+\s*\w)/.exec(t)
        const um = /used\s*=\s*([\d.]+\s*\w)/.exec(t)
        const fm = /free\s*=\s*([\d.]+\s*\w)/.exec(t)
        state.swap = { total: tm ? parseBytes(tm[1]) : null, used: um ? parseBytes(um[1]) : null, free: fm ? parseBytes(fm[1]) : null }
      }
      if (sec.IP) {
        const ip = sec.IP.trim()
        if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) state.ip = ip
      }
      if (sec.HOST) {
        const L = sec.HOST.split('\n').map(s => s.trim()).filter(s => s)
        if (L[0]) { const bm = /sec\s*=\s*(\d+)/.exec(L[0]); if (bm) state.hw.bootSec = parseInt(bm[1], 10) }
        if (L[1] && L[1].length < 128) state.hw.hostname = L[1]
        if (L[2]) state.hw.brand = L[2]
        if (L[3] && isFinite(parseInt(L[3], 10))) state.hw.memsize = parseInt(L[3], 10)
        if (L[4] && isFinite(parseInt(L[4], 10))) state.hw.ncpu = parseInt(L[4], 10)
        if (L[5]) state.hw.model = L[5]
      }
    }
    const tick = async () => {
      if (state.tickBusy) return
      if (state.tickCount > 0 && !active()) return
      state.tickBusy = true
      try {
        state.tickCount++
        const slow = (state.tickCount % 10) === 1
        const cmd = slow ? FAST_CMD + '\n' + slowCmd() : FAST_CMD
        const text = await runSh(cmd, 30000)
        if (text) {
          const sec = splitSections(text)
          const now = Date.now()
          const tk = { t: now, freePct: null, freeB: null, wiredB: null, compB: null, activeB: null, inactiveB: null, usedB: null, swapin: null, swapout: null, ioBps: null, tps: null, psCpu: [], psMem: [], rxBps: null, txBps: null }
          if (sec.VM) {
            let pageSize = 16384
            const pm = /page size of (\d+)/.exec(sec.VM)
            if (pm) pageSize = parseInt(pm[1], 10) || 16384
            const num = (re) => { const m = re.exec(sec.VM); return m ? parseInt(m[1], 10) * pageSize : null }
            tk.freeB = num(/^Pages free:\s*(\d+)/m)
            const specB = num(/^Pages speculative:\s*(\d+)/m)
            if (tk.freeB !== null && specB !== null) tk.freeB += specB
            tk.activeB = num(/^Pages active:\s*(\d+)/m)
            tk.inactiveB = num(/^Pages inactive:\s*(\d+)/m)
            tk.wiredB = num(/^Pages wired down:\s*(\d+)/m)
            const cpm = /occupied by compressor:\s*(\d+)/.exec(sec.VM)
            tk.compB = cpm ? parseInt(cpm[1], 10) * pageSize : null
            const sim = /^Swapins:\s*(\d+)/m.exec(sec.VM)
            tk.swapin = sim ? parseInt(sim[1], 10) : null
            const som = /^Swapouts:\s*(\d+)/m.exec(sec.VM)
            tk.swapout = som ? parseInt(som[1], 10) : null
            const anonm = /^Anonymous pages:\s*(\d+)/m.exec(sec.VM)
            const anonB = anonm ? parseInt(anonm[1], 10) * pageSize : null
            tk.usedB = (tk.wiredB !== null && tk.compB !== null && anonB !== null) ? tk.wiredB + tk.compB + anonB : null
          }
          if (sec.MP) { const m = /free percentage:\s*(\d+)%/.exec(sec.MP); if (m) tk.freePct = parseInt(m[1], 10) }
          if (sec.PS1) tk.psCpu = parsePsCpu(sec.PS1)
          if (sec.PS2) tk.psMem = parsePsMem(sec.PS2)
          if (sec.NET) {
            const cur = parseNetstat(sec.NET)
            if (cur) {
              const prev = state.lastNet
              state.lastNet = { t: now, rx: cur.rx, tx: cur.tx }
              if (prev && cur.rx >= prev.rx && cur.tx >= prev.tx) {
                const dt = (now - prev.t) / 1000
                if (dt > 0.5 && dt < 30) { tk.rxBps = (cur.rx - prev.rx) / dt; tk.txBps = (cur.tx - prev.tx) / dt }
              }
            }
          }
          state.lastTick = tk
          const h = state.history
          if (h.length) {
            const p = h[h.length - 1]
            if (tk.rxBps !== null) { p.rxBps = tk.rxBps; p.txBps = tk.txBps }
            if (tk.freePct !== null) p.memPct = Math.max(0, Math.min(100, 100 - tk.freePct))
          }
          if (slow) { parseSlow(sec); collectServices(sec) }
        }
      } catch (e) {
        console.error('mac-perf tick: ' + (e && e.message))
      } finally {
        state.tickBusy = false
      }
    }

    const buildMeta = () => ({
      chip: state.hw.brand, model: state.hw.model, hostname: state.hw.hostname,
      cores: state.hw.ncpu, memTotal: state.hw.memsize, bootSec: state.hw.bootSec,
      iface: state.iface, ip: state.ip, df: state.df, batt: state.batt, swap: state.swap, svc: state.svc,
    })

    // Client→Host channel for the static plugin: a same-origin JSON route on
    // the dsh web server (the sanctioned webServer.register path used by
    // /api, /plugins and the HMR stream). Browser auth applies when the
    // connection service is mounted.
    const connection = ctx.get('connection')
    const snapshotBody = () => {
      state.lastRequestTs = Date.now()
      drainTop()
      drainIo()
      const h = state.history
      return JSON.stringify({
        ok: true, now: Date.now(), streamOk: state.streamOk, ioOk: state.ioOk,
        meta: buildMeta(), latest: h.length ? h[h.length - 1] : null,
        tick: state.lastTick, history: h.slice(-180),
      })
    }
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path: '/mac-perf/snapshot',
      handler: (req, res) => {
        if (connection !== undefined) {
          const rejection = connection.requestRejection(req)
          if (rejection !== undefined) {
            res.writeHead(rejection)
            res.end(rejection === 401 ? 'unauthorized' : 'forbidden')
            return
          }
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(snapshotBody())
      },
    }), 'mac-perf: snapshot route')

    ctx.effect(() => {
      const killers = []
      try {
        const s1 = shell.resolve({ command: '/usr/bin/top -l 0 -s 2 -n 0', stdoutMaxBytes: 4000000, sandboxPolicy: PERF_POLICY })
        topProc = shell.start(s1)
        killers.push(() => { try { topProc.kill() } catch (e) {} })
      } catch (e) { console.error('mac-perf: top stream failed: ' + (e && e.message)) }
      try {
        const s2 = shell.resolve({ command: '/usr/sbin/iostat -d -w 2', stdoutMaxBytes: 2000000, sandboxPolicy: PERF_POLICY })
        ioProc = shell.start(s2)
        killers.push(() => { try { ioProc.kill() } catch (e) {} })
      } catch (e) { console.error('mac-perf: iostat stream failed: ' + (e && e.message)) }
      return () => { for (let i = 0; i < killers.length; i++) { try { killers[i]() } catch (e) {} } }
    }, 'mac-perf: background streams')
    ctx.effect(() => ctx.interval(() => { drainTop(); drainIo() }, 1000), 'mac-perf: drain interval')
    ctx.effect(() => ctx.interval(tick, 3000), 'mac-perf: tick interval')

    const boot = async () => {
      try {
        const r = await runSh('/sbin/route -n get default 2>/dev/null | /usr/bin/grep interface')
        if (r) { const m = /interface:\s*(\S+)/.exec(r); if (m) state.iface = m[1] }
      } catch (e) {}
      try { await tick() } catch (e) {}
    }
    boot()}
