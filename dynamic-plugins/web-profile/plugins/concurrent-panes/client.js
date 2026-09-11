/**
 * Concurrent panes — browser half.
 *
 * A second Conversation View next to Chat and Trajectory: it tiles 1-4 Session
 * panes inside the centre column so the concurrent work of one dsh home is
 * readable at a glance instead of one Session at a time. Each pane streams its
 * own Session's live output — the settled transcript tail, the in-flight
 * assistant text, and the running Tool calls — with that Session's status,
 * elapsed turn time, background jobs, running subagent descendants and token
 * total in the header, plus focus / pin / stop controls.
 *
 * Data path: `ctx.sessions.binding(id)` for any listed Session (subagent-origin
 * rows included) → `session.open()` (the shell only stages the current Session,
 * so a pane opens its own history window) → `ctx.uiConversation.binding(...)
 * .target('chat')`, subscribed so the target activates and the pane follows the
 * assembly live. Nothing is polled except a slow safety tick that retries a
 * window that failed to open.
 *
 * Static-plugin rules: the module self-registers through `__ModuleLoader__.load`
 * as CJS, React comes from the platform module table, and every `ctx.<service>`
 * read is declared in `inject`.
 * @module dsh-concurrent-panes/client
 */

window.__ModuleLoader__.load({
  id: 'dsh-concurrent-panes',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    const React = require('react');
    /** createElement shorthand for every component in this module. */
    const el = React.createElement;
    // The module-table require, kept so apply() can reach the seeded
    // ui-primitives namespace (guarded: a miss must not break the plugin).
    const table = require

    const name = 'concurrent-panes'
    const inject = ['slots', 'locale', 'settingsScope', 'timer']

    /** Settings namespace owned by the host half. */
    const NS = 'concurrent-panes'
    /** Field defaults; also the shape a snapshot is normalized into. */
    const DEFAULTS = {
      columns: 2,
      autoFill: true,
      paneIds: [],
      density: 'comfy',
      tail: 40,
      showReasoning: false,
      showJobs: true,
      follow: true,
    }
    /** Pane counts offered by the toolbar. */
    const COLUMN_CHOICES = [1, 2, 3, 4]
    /** Ceiling on remembered auto assignments, so shrinking the grid keeps them. */
    const AUTO_MEMORY = 8
    /** How long a hub notification is coalesced before React is told. */
    const FLUSH_MS = 120
    /** Safety tick: retry a pane window that never opened. */
    const TICK_MS = 2500

    /** Every page string, per language. */
    function strings(lang) {
      if (lang === 'zh') {
        return {
          viewLabel: '并发',
          bar: {
            panes: '窗格',
            auto: '自动填充',
            reset: '重排',
            tasks: (running, total) => running + ' 个任务运行中 · 共 ' + total + ' 个会话',
            idle: '当前没有任务在运行',
          },
          pane: {
            pick: '切换会话',
            empty: '选择会话',
            focus: '在 Chat 中打开',
            stop: '停止本轮',
            stopConfirm: '停止？',
            pin: '固定此窗格',
            unpin: '取消固定（交回自动填充）',
            current: '当前',
            running: '运行中',
            waiting: '等待你确认',
            error: '出错',
            idle: '空闲',
            loading: '正在加载历史…',
            loadFailed: '历史加载失败',
            blank: '还没有内容',
            subagents: (n) => n + ' 个子任务',
            jobs: (n) => n + ' 个后台任务',
            tokens: '本轮',
          },
          block: {
            you: '你',
            steer: '插话',
            context: '上下文',
            reasoning: '思考',
            note: '记录',
            empty: '（无输出）',
            failed: '执行失败',
          },
          md: { copy: '复制', copied: '已复制', footnotes: '脚注' },
          term: {
            running: '运行中',
            failed: '失败',
            done: '完成',
            copy: '复制',
            copied: '已复制',
            noOutput: '（无输出）',
            collapseAria: '收起输出',
            collapse: '收起',
            expandAria: (n) => '展开其余 ' + n + ' 行',
            expand: (n) => '展开其余 ' + n + ' 行',
            signal: (signal) => '信号 ' + signal,
            exitCode: (code) => '退出码 ' + code,
          },
          page: {
            sectionLabel: '并发窗格',
            title: '并发窗格',
            desc: '把 dsh 的并发工作放进同一个画面：每个窗格是一个会话的实时输出——正式回复按对话排版渲染（含代码块、列表、表格），工具调用收成一行一行的小卡片（bash 用产品同款终端卡），正在生成的内容带光标。表头给出状态、本轮耗时、后台任务、运行中的子 agent 与 token 用量；窗格默认自动填入正在运行的会话，也可以手动钉住。',
            layout: '布局',
            columns: '窗格数',
            autoFill: '自动填入正在运行的会话',
            autoFillHint: '关闭后只显示手动钉住的窗格',
            density: '行距',
            comfy: '宽松',
            compact: '紧凑',
            tail: '每个窗格保留最近',
            tailUnit: '条',
            showReasoning: '显示思考过程',
            showReasoningHint: '关闭时只显示正式回复与工具调用',
            showJobs: '在表头显示后台任务',
            follow: '自动跟随最新输出',
            followHint: '关闭后滚动位置不会被新输出打断',
            pinned: '已钉住的窗格',
            pinnedHint: '在窗格表头用图钉固定，固定后不再参与自动填充',
          },
        }
      }
      return {
        viewLabel: 'Panes',
        bar: {
          panes: 'Panes',
          auto: 'Auto-fill',
          reset: 'Re-arrange',
          tasks: (running, total) => running + ' running · ' + total + ' sessions',
          idle: 'Nothing is running right now',
        },
        pane: {
          pick: 'Switch session',
          empty: 'Pick a session',
          focus: 'Open in Chat',
          stop: 'Stop turn',
          stopConfirm: 'Stop?',
          pin: 'Pin this pane',
          unpin: 'Unpin (hand back to auto-fill)',
          current: 'current',
          running: 'running',
          waiting: 'waiting for you',
          error: 'error',
          idle: 'idle',
          loading: 'Loading history…',
          loadFailed: 'History failed to load',
          blank: 'Nothing yet',
          subagents: (n) => (n === 1 ? '1 subagent' : n + ' subagents'),
          jobs: (n) => (n === 1 ? '1 job' : n + ' jobs'),
          tokens: 'turn',
        },
        block: {
          you: 'You',
          steer: 'Steer',
          context: 'Context',
          reasoning: 'Thinking',
          note: 'Note',
          empty: '(no output)',
          failed: 'Call failed',
        },
        md: { copy: 'Copy', copied: 'Copied', footnotes: 'Footnotes' },
        term: {
          running: 'Running',
          failed: 'Failed',
          done: 'Done',
          copy: 'Copy',
          copied: 'Copied',
          noOutput: '(no output)',
          collapseAria: 'Collapse output',
          collapse: 'Collapse',
          expandAria: (n) => 'Show ' + n + ' more lines',
          expand: (n) => 'Show ' + n + ' more lines',
          signal: (signal) => 'signal ' + signal,
          exitCode: (code) => 'exit ' + code,
        },
        page: {
          sectionLabel: 'Concurrent panes',
          title: 'Concurrent panes',
          desc: 'Puts the harness\'s concurrent work in one picture: every pane is one session\'s live output — replies render as conversation (code blocks, lists and tables included), tool calls collapse into one-line cards (bash uses the product\'s own terminal card), and text still being written carries a caret. The header carries status, elapsed turn time, background jobs, running subagents and token total. Panes auto-fill with running sessions, and any pane can be pinned.',
          layout: 'Layout',
          columns: 'Panes',
          autoFill: 'Auto-fill with running sessions',
          autoFillHint: 'Off: only pinned panes stay visible',
          density: 'Row rhythm',
          comfy: 'Comfortable',
          compact: 'Compact',
          tail: 'Rows kept per pane',
          tailUnit: 'rows',
          showReasoning: 'Show reasoning',
          showReasoningHint: 'Off: replies and tool calls only',
          showJobs: 'Show background jobs in the header',
          follow: 'Follow the newest output',
          followHint: 'Off: new output never moves your scroll position',
          pinned: 'Pinned panes',
          pinnedHint: 'Pin from a pane header; pinned panes stay out of auto-fill',
        },
      }
    }

    /**
     * Product chrome labels for the primitives, cached per language so the
     * markdown renderer's streaming state survives re-renders (its identity is
     * a memo input).
     */
    var labelCache = { lang: null, md: null, term: null }

    /** @returns {object} the MarkdownText label set for the active language. */
    function mdLabels() {
      var values = text()
      if (labelCache.lang !== runtime.lang) {
        labelCache.lang = runtime.lang
        labelCache.md = { code: { copyLabel: values.md.copy, copiedLabel: values.md.copied }, footnotes: values.md.footnotes }
        labelCache.term = {
          signal: values.term.signal,
          exitCode: values.term.exitCode,
          running: values.term.running,
          failed: values.term.failed,
          done: values.term.done,
          copy: values.term.copy,
          copied: values.term.copied,
          noOutput: values.term.noOutput,
          collapseAria: values.term.collapseAria,
          collapse: values.term.collapse,
          expandAria: values.term.expandAria,
          expand: values.term.expand,
        }
      }
      return labelCache.md
    }

    /** @returns {object} the TerminalBlock label set for the active language. */
    function termLabels() {
      mdLabels()
      return labelCache.term
    }

    /* ------------------------------------------------------------------ */
    /* helpers                                                             */
    /* ------------------------------------------------------------------ */

    /** Compact token count, mirroring the transcript's own usage pill. */
    function formatTokens(value) {
      if (typeof value !== 'number' || !isFinite(value) || value < 0) return null
      function scaled(candidate) {
        return candidate >= 100 ? String(Math.round(candidate)) : String(Math.round(candidate * 10) / 10)
      }
      if (value < 1000) return String(value)
      if (value < 1000000) return scaled(value / 1000) + 'K'
      return scaled(value / 1000000) + 'M'
    }

    /** Coarse elapsed time: 42s, 7m12s, 1h04m. */
    function formatDuration(ms) {
      if (typeof ms !== 'number' || !isFinite(ms) || ms < 0) return null
      var seconds = Math.floor(ms / 1000)
      if (seconds < 60) return seconds + 's'
      var minutes = Math.floor(seconds / 60)
      if (minutes < 60) return minutes + 'm' + String(seconds % 60).padStart(2, '0') + 's'
      return Math.floor(minutes / 60) + 'h' + String(minutes % 60).padStart(2, '0') + 'm'
    }

    /** Basename of a working directory. */
    function baseName(path) {
      if (typeof path !== 'string' || path === '') return null
      var parts = path.replace(/\/+$/, '').split('/')
      return parts[parts.length - 1] || path
    }

    /** Collapse whitespace and clip to a bounded preview. */
    function clip(text, limit) {
      if (typeof text !== 'string') return ''
      var collapsed = text.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
      if (collapsed.length <= limit) return collapsed
      return collapsed.slice(0, limit) + ' …'
    }

    /** Flatten one content-block array into display text. */
    function textOfContent(content) {
      if (!Array.isArray(content)) return ''
      var parts = []
      for (var i = 0; i < content.length; i++) {
        var block = content[i]
        if (block === null || typeof block !== 'object') continue
        if (block.type === 'text' && typeof block.text === 'string') parts.push(block.text)
        else if (block.type === 'image') parts.push('[image]')
        else if (block.type === 'reasoning' && typeof block.text === 'string') parts.push(block.text)
      }
      return parts.join('\n')
    }

    /** Read one settings snapshot into a fully populated config object. */
    function readConfig(scope) {
      var raw = null
      try {
        var snapshot = scope.getSnapshot()
        raw = snapshot === null || snapshot === undefined ? null : snapshot.value
      } catch (error) {
        // A namespace whose host half is not mounted yet reads as absent; the
        // defaults stand and every later accepted snapshot is adopted.
        raw = null
      }
      var source = raw !== null && typeof raw === 'object' ? raw : {}
      var columns = Number(source.columns)
      if (!isFinite(columns)) columns = DEFAULTS.columns
      columns = Math.max(1, Math.min(4, Math.round(columns)))
      var tail = Number(source.tail)
      if (!isFinite(tail)) tail = DEFAULTS.tail
      tail = Math.max(8, Math.min(200, Math.round(tail)))
      var paneIds = []
      if (Array.isArray(source.paneIds)) {
        for (var i = 0; i < source.paneIds.length; i++) {
          paneIds.push(typeof source.paneIds[i] === 'string' ? source.paneIds[i] : '')
        }
      }
      return {
        columns: columns,
        autoFill: source.autoFill === undefined ? DEFAULTS.autoFill : source.autoFill === true,
        paneIds: paneIds,
        density: source.density === 'compact' ? 'compact' : 'comfy',
        tail: tail,
        showReasoning: source.showReasoning === true,
        showJobs: source.showJobs === undefined ? DEFAULTS.showJobs : source.showJobs === true,
        follow: source.follow === undefined ? DEFAULTS.follow : source.follow === true,
      }
    }

    /* ------------------------------------------------------------------ */
    /* data hub: one live feed per Session                                 */
    /* ------------------------------------------------------------------ */

    /**
     * Owns every Session feed the panes read: the history window of each visible
     * Session, the Chat target subscription that keeps it assembled, and one
     * coalesced notification for React.
     * @param {object} ctx - the client plugin context.
     * @returns {object} the hub.
     */
    function createHub(ctx) {
      var listeners = new Set()
      var feeds = new Map()
      var wanted = new Set()
      var queued = null
      var pendingBump = false

      function flush() {
        queued = null
        var batch = Array.from(listeners)
        for (var i = 0; i < batch.length; i++) {
          try {
            batch[i]()
          } catch (error) {
            console.error('concurrent-panes: listener failed', error)
          }
        }
      }

      /** Coalesce the stream flood into one React notification. */
      function notify() {
        if (queued !== null) return
        queued = ctx.timeout(flush, FLUSH_MS)
      }

      function sessionOf(feed) {
        try {
          return feed.session.getSnapshot()
        } catch (error) {
          return null
        }
      }

      function chatOf(feed) {
        if (feed.target === null) return null
        try {
          return feed.target.getSnapshot() || null
        } catch (error) {
          return null
        }
      }

      function disposeFeed(feed) {
        for (var i = 0; i < feed.offs.length; i++) {
          try {
            feed.offs[i]()
          } catch (error) {
            // A disposer that already ran is not an error worth surfacing.
          }
        }
        feed.offs = []
        feeds.delete(feed.id)
      }

      /**
       * Open a pane Session's history window. The shell stages exactly one
       * Session, so a non-current pane has to open its own; the window is
       * idempotent and reopening after a failure is safe. Five failed attempts
       * stop the retry loop so a permanently broken Session cannot spin.
       */
      function ensureOpen(feed) {
        if (feed.failures >= 5) return
        var snapshot = sessionOf(feed)
        if (snapshot === null) return
        if (snapshot.openState === 'open' || snapshot.openState === 'loading') return
        if (feed.opening) {
          // A request that never settles would otherwise block every retry.
          if (Date.now() - feed.openedAt < 30000) return
          feed.opening = false
        }
        if (typeof feed.session.open !== 'function') return
        feed.opening = true
        feed.openedAt = Date.now()
        var result = null
        try {
          result = feed.session.open()
        } catch (error) {
          feed.opening = false
          feed.failures++
          return
        }
        if (result !== null && result !== undefined && typeof result.then === 'function') {
          result.then(function () {
            feed.opening = false
            notify()
          }, function () {
            feed.opening = false
            feed.failures++
          })
        } else {
          feed.opening = false
        }
      }

      /** Create the feed for one Session id, or null while it is not addressable. */
      function feedFor(id) {
        var existing = feeds.get(id)
        if (existing !== undefined) return existing
        var sessions = ctx.get('sessions')
        var conversation = ctx.get('uiConversation')
        if (sessions === undefined || conversation === undefined) return null
        if (typeof sessions.binding !== 'function' || typeof conversation.binding !== 'function') return null
        var binding = null
        try {
          binding = sessions.binding(id)
        } catch (error) {
          binding = null
        }
        if (binding === null || binding === undefined) return null
        var feed = { id: id, session: binding.session, target: null, offs: [], opening: false, openedAt: 0, failures: 0 }
        feeds.set(id, feed)
        if (typeof feed.session.subscribe === 'function') {
          feed.offs.push(feed.session.subscribe(notify))
        }
        try {
          // Subscribing activates the Chat target, which is what makes the
          // assembly follow this Session for the rest of its lifetime.
          feed.target = conversation.binding(binding).target('chat')
          feed.offs.push(feed.target.subscribe(notify))
        } catch (error) {
          feed.target = null
        }
        ensureOpen(feed)
        return feed
      }

      return {
        /** Mark one Session as pane-visible and make sure its feed exists. */
        want: function (id) {
          wanted.add(id)
          return feedFor(id)
        },
        /**
         * Replace the pane-visible set and release the feeds it no longer
         * contains. Releasing is cheap and lossless: the Session's own history
         * window (opened once) stays open and `open()` is idempotent, so a pane
         * that comes back re-subscribes instead of re-fetching.
         */
        setWanted: function (ids) {
          wanted.clear()
          for (var i = 0; i < ids.length; i++) wanted.add(ids[i])
          var doomed = []
          feeds.forEach(function (feed, id) {
            if (!wanted.has(id)) doomed.push(feed)
          })
          for (var j = 0; j < doomed.length; j++) disposeFeed(doomed[j])
        },
        /** Read a pane's live snapshots without subscribing. */
        read: function (id) {
          var feed = feeds.get(id)
          if (feed === undefined) return { ready: false, session: null, chat: null }
          return { ready: true, session: sessionOf(feed), chat: chatOf(feed) }
        },
        /** Drop feeds whose Session left the list (its scope is torn down too). */
        reconcile: function (byId) {
          var doomed = []
          feeds.forEach(function (feed, id) {
            if (byId[id] === undefined) doomed.push(feed)
          })
          for (var i = 0; i < doomed.length; i++) disposeFeed(doomed[i])
        },
        /** Retry a window that has not opened yet; called on a slow tick. */
        tick: function () {
          feeds.forEach(function (feed) {
            ensureOpen(feed)
          })
        },
        /** Re-render React without waiting for a stream event. */
        bump: notify,
        subscribe: function (listener) {
          listeners.add(listener)
          return function () {
            listeners.delete(listener)
          }
        },
        dispose: function () {
          if (queued !== null) {
            queued()
            queued = null
          }
          feeds.forEach(disposeFeed)
          listeners.clear()
          wanted.clear()
        },
      }
    }

    /** The one hub this plugin load owns, closed over by its components. */
    var runtime = { hub: null, scope: null, locale: null, auto: [], strings: null, P: null, lang: 'en' }

    /** Current-language dictionary. */
    function text() {
      return runtime.strings
    }

    /** Adopt the active locale's dictionary (called at apply and on switch). */
    function setLanguage() {
      runtime.lang = String(runtime.locale.getLocale().active).indexOf('zh') === 0 ? 'zh' : 'en'
      runtime.strings = strings(runtime.lang)
    }

    /** The seeded product primitives, or null when the table does not serve them. */
    function primitives() {
      return runtime.P
    }

    /**
     * Whether a module export is usable as a React element type. `memo()` and
     * `lazy()` exports are objects carrying a symbol `$$typeof`, so a plain
     * `typeof === 'function'` test would skip them.
     * @param {unknown} value - one module export.
     * @returns {boolean} whether it can be rendered.
     */
    function component(value) {
      if (typeof value === 'function') return true
      return value !== null && typeof value === 'object' && typeof value.$$typeof === 'symbol'
    }

    /* ------------------------------------------------------------------ */
    /* React plumbing                                                      */
    /* ------------------------------------------------------------------ */

    /** Subscribe to settings; the returned config is re-read on every change. */
    function useConfig() {
      var pair = React.useState(function () { return readConfig(runtime.scope) })
      React.useEffect(function () {
        return runtime.scope.subscribe(function () { pair[1](readConfig(runtime.scope)) })
      }, [])
      return pair[0]
    }

    /** Re-render on coalesced hub notifications. */
    function useHubVersion(hub) {
      var pair = React.useState(0)
      React.useEffect(function () {
        return hub.subscribe(function () { pair[1](function (n) { return n + 1 }) })
      }, [hub])
      return pair[0]
    }

    /** Write one field or one array field through the settings scope. */
    function writeConfig(ops) {
      var result = runtime.scope.mutate(ops)
      if (result !== null && result !== undefined && typeof result.then === 'function') {
        result.then(function () {}, function (error) {
          console.error('concurrent-panes: settings write failed', error)
        })
      }
    }

    /**
     * Replace slot `index`'s explicit assignment, padding the array as needed.
     * One Session belongs to at most one pane: assigning it here clears the
     * other slot that held it, so the freed slot auto-fills instead of showing
     * an unrelated Session behind a duplicate pin.
     */
    function assignSlot(config, index, id) {
      var next = config.paneIds.slice(0)
      while (next.length <= index) next.push('')
      if (id !== '') {
        for (var i = 0; i < next.length; i++) {
          if (i !== index && next[i] === id) next[i] = ''
        }
      }
      next[index] = id
      // Trailing free slots carry no information; storing them would only make
      // the durable section harder to read.
      while (next.length > 0 && next[next.length - 1] === '') next.pop()
      writeConfig([{ op: 'set', path: ['paneIds'], value: next }])
    }

    /* ------------------------------------------------------------------ */
    /* session facts                                                       */
    /* ------------------------------------------------------------------ */

    /**
     * Per-list-snapshot memo. The list store replaces its state object exactly
     * when the list changes, so a WeakMap keyed by that object is invalidated
     * by construction — and these derivations run for every pane on every
     * stream notification.
     */
    var derivationCache = new WeakMap()

    /** Cached derivation for one list snapshot, built on first use. */
    function derived(list) {
      var entry = derivationCache.get(list)
      if (entry === undefined) {
        entry = { children: null, order: new Map() }
        derivationCache.set(list, entry)
      }
      return entry
    }

    /** Index subagent children by parent so one pane can count its live workers. */
    function childIndex(list) {
      var entry = derived(list)
      if (entry.children !== null) return entry.children
      var children = {}
      var ids = list.ids
      for (var i = 0; i < ids.length; i++) {
        var summary = list.byId[ids[i]]
        if (summary === undefined || summary.origin !== 'subagent' || summary.parentId === undefined) continue
        if (children[summary.parentId] === undefined) children[summary.parentId] = []
        children[summary.parentId].push(summary)
      }
      entry.children = children
      return children
    }

    /** Running subagent descendants reachable through uninterrupted subagent lineage. */
    function runningDescendants(children, id) {
      var out = []
      var seen = {}
      var queue = (children[id] || []).slice(0)
      while (queue.length > 0) {
        var summary = queue.shift()
        if (summary === undefined || seen[summary.id] === true) continue
        seen[summary.id] = true
        if (summary.running) out.push(summary)
        var grand = children[summary.id]
        if (grand !== undefined) queue = queue.concat(grand)
      }
      return out
    }

    /** Live jobs of one Session, live ones first. */
    function jobsOf(list, id) {
      var jobs = list.jobsBySession[id]
      return Array.isArray(jobs) ? jobs : []
    }

    /** Last turn's timing and token total, read from the Chat projection. */
    function turnFacts(chat) {
      var facts = { turn: null, start: null, end: null, tokens: null }
      if (chat === null || chat === undefined) return facts
      var legacy = chat.legacy
      var timings = legacy === null || legacy === undefined ? null : legacy.turnTimings
      if (timings !== null && timings !== undefined && typeof timings.forEach === 'function') {
        timings.forEach(function (value, turn) {
          if (facts.turn === null || turn > facts.turn) {
            facts.turn = turn
            facts.start = value === null || value === undefined ? null : value.startTime
            facts.end = value === null || value === undefined ? null : value.endTime
          }
        })
      }
      var timeline = chat.timeline
      if (facts.turn !== null && timeline !== null && timeline !== undefined && timeline.turns !== undefined) {
        var record = timeline.turns.get(facts.turn)
        var store = record === null || record === undefined ? null : record.data
        var tail = store !== null && store !== undefined && typeof store.get === 'function' ? store.get('turn-tail') : null
        var usage = tail === null || tail === undefined ? null : tail.tokenUsage
        if (usage !== null && usage !== undefined && typeof usage.totalTokens === 'number') facts.tokens = usage.totalTokens
      }
      return facts
    }

    /** Ranking of a Session as a pane candidate: lower is more interesting. */
    function candidateScore(list, children, id, currentId) {
      if (id === currentId) return -1
      var summary = list.byId[id]
      if (summary === undefined) return 99
      var live = summary.running === true
      var jobs = jobsOf(list, id)
      var working = false
      for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].status === 'running' || jobs[i].status === 'stopping') working = true
      }
      if (live) return summary.origin === 'subagent' ? 1 : 0
      if (working) return 1
      if (runningDescendants(children, id).length > 0) return 2
      return 4
    }

    /**
     * Session ids ordered for the pane picker and the auto-fill pool. The score
     * of every row is computed once per (list, current) pair: a comparator that
     * scored inside the sort would re-walk subagent subtrees O(n log n) times,
     * in every pane, on every stream notification.
     */
    function orderedIds(list, currentId) {
      var entry = derived(list)
      var cached = entry.order.get(currentId)
      if (cached !== undefined) return cached
      var children = childIndex(list)
      var ids = list.ids.slice(0)
      if (currentId !== undefined && list.byId[currentId] !== undefined && ids.indexOf(currentId) < 0) {
        ids.unshift(currentId)
      }
      var scores = new Map()
      for (var i = 0; i < ids.length; i++) scores.set(ids[i], candidateScore(list, children, ids[i], currentId))
      ids.sort(function (left, right) {
        var delta = scores.get(left) - scores.get(right)
        if (delta !== 0) return delta
        var leftAt = list.byId[left] === undefined ? 0 : list.byId[left].updatedAt || 0
        var rightAt = list.byId[right] === undefined ? 0 : list.byId[right].updatedAt || 0
        return rightAt - leftAt
      })
      entry.order.set(currentId, ids)
      return ids
    }

    /**
     * Resolve the grid: explicit assignments first, then the remembered
     * auto layout, then freshly interesting Sessions.
     */
    function resolvePanes(list, config, currentId) {
      var slots = []
      var used = {}
      var i = 0
      for (i = 0; i < config.columns; i++) {
        var explicit = config.paneIds[i]
        if (typeof explicit === 'string' && explicit !== '' && list.byId[explicit] !== undefined && used[explicit] !== true) {
          slots[i] = explicit
          used[explicit] = true
        }
      }
      var alive = runtime.auto.filter(function (id) {
        return list.byId[id] !== undefined && used[id] !== true
      })
      for (i = 0; i < config.columns; i++) {
        if (slots[i] !== undefined) continue
        var pick
        if (alive.length > 0) {
          pick = alive.shift()
        } else if (config.autoFill) {
          var pool = orderedIds(list, currentId)
          var poolChildren = childIndex(list)
          for (var k = 0; k < pool.length; k++) {
            if (used[pool[k]] === true) continue
            if (candidateScore(list, poolChildren, pool[k], currentId) > 3) continue
            pick = pool[k]
            break
          }
        }
        if (pick === undefined) {
          if (config.autoFill && runtime.auto.indexOf(currentId) < 0 && currentId !== undefined && used[currentId] !== true && list.byId[currentId] !== undefined) {
            pick = currentId
          }
        }
        if (pick !== undefined) {
          slots[i] = pick
          used[pick] = true
          if (runtime.auto.indexOf(pick) < 0) runtime.auto.push(pick)
        }
      }
      if (runtime.auto.length > AUTO_MEMORY) runtime.auto = runtime.auto.slice(0, AUTO_MEMORY)
      return slots
    }

    /* ------------------------------------------------------------------ */
    /* transcript rows                                                     */
    /* ------------------------------------------------------------------ */

    /** Parse a tool call's raw JSON arguments once. */
    function parseArgs(argsRaw) {
      if (typeof argsRaw !== 'string' || argsRaw.trim() === '') return null
      try {
        var value = JSON.parse(argsRaw)
        return value !== null && typeof value === 'object' && Array.isArray(value) === false ? value : null
      } catch (error) {
        // Non-JSON arguments are the model's own text; the raw head stays the hint.
        return null
      }
    }

    /** Split a shell result into its output and the trailing status marker. */
    function parseExitStatus(value) {
      var signal = /\n\[killed by signal: ([^\]\n]+)\]$/.exec(value)
      if (signal !== null) return { output: value.slice(0, signal.index), signal: signal[1] }
      var exit = /\n\[exit code: (\d+)\]$/.exec(value)
      if (exit !== null) return { output: value.slice(0, exit.index), exitCode: Number(exit[1]) }
      return { output: value, exitCode: 0 }
    }

    /** Ordered keys whose value reads as a useful one-line argument preview. */
    var HINT_KEYS = ['description', 'command', 'file_path', 'path', 'pattern', 'query', 'url', 'task', 'prompt', 'skill', 'name']

    /** One-line preview of a tool call's arguments. */
    function argsHint(args, argsRaw, name) {
      if (args !== null) {
        for (var i = 0; i < HINT_KEYS.length; i++) {
          var value = args[HINT_KEYS[i]]
          if (typeof value === 'string' && value.trim() !== '') return clip(value, 120)
        }
        for (var key in args) {
          if (!Object.prototype.hasOwnProperty.call(args, key)) continue
          var candidate = args[key]
          if (typeof candidate === 'string' && candidate.trim() !== '') return clip(candidate, 120)
        }
      }
      if (typeof argsRaw === 'string' && argsRaw.trim() !== '') return clip(argsRaw, 120)
      return name
    }

    /** Push one settled Conversation node into the block buffer. */
    function pushNode(blocks, node, config) {
      if (node === null || node === undefined) return
      var kind = node.kind
      var seq = typeof node.seq === 'number' ? node.seq : 0
      if (kind === 'user' || kind === 'steering') {
        var said = textOfContent(node.content)
        if (said.trim() === '') return
        blocks.push({ key: 'u' + seq, kind: 'user', label: kind === 'user' ? text().block.you : text().block.steer, text: said })
        return
      }
      if (kind === 'context') {
        blocks.push({ key: 'c' + seq, kind: 'note', label: text().block.context, text: clip(textOfContent(node.content), 400) })
        return
      }
      if (kind === 'assistant') {
        var parts = Array.isArray(node.blocks) ? node.blocks : []
        var last = -1
        for (var i = 0; i < parts.length; i++) {
          if (parts[i] !== null && typeof parts[i] === 'object' && parts[i].kind === 'text' && String(parts[i].text).trim() !== '') last = i
        }
        for (var j = 0; j < parts.length; j++) {
          var block = parts[j]
          if (block === null || typeof block !== 'object') continue
          if (block.kind === 'text' && typeof block.text === 'string' && block.text.trim() !== '') {
            // One settled node is one message: the trailing text block stays
            // whole, earlier ones are interim narration.
            blocks.push({ key: 'a' + seq + '-' + j, kind: 'assistant', text: block.text, interim: j !== last })
          } else if (block.kind === 'reasoning' && config.showReasoning && typeof block.text === 'string' && block.text.trim() !== '') {
            blocks.push({ key: 'r' + seq + '-' + j, kind: 'reasoning', text: block.text })
          }
        }
        return
      }
      if (kind === 'tool-result') {
        var call = node.call
        var name = call === null || call === undefined ? 'tool' : call.name
        var argsRaw = call === null || call === undefined ? '' : call.argsRaw
        var args = parseArgs(argsRaw)
        blocks.push({
          key: 't' + seq,
          kind: 'tool',
          name: name,
          args: args,
          argsRaw: argsRaw,
          hint: argsHint(args, argsRaw, name),
          output: textOfContent(node.content),
          state: node.isError === true ? 'error' : 'done',
          duration: node.callTime !== null && node.callTime !== undefined && typeof node.time === 'number'
            ? node.time - node.callTime
            : null,
        })
        return
      }
      if (kind === 'turn-error') {
        blocks.push({ key: 'e' + seq, kind: 'error', text: clip(String(node.message === undefined ? '' : node.message), 500) })
        return
      }
      if (kind === 'model-retry') {
        blocks.push({ key: 'y' + seq, kind: 'note', label: text().block.note, text: 'retry · ' + String(node.retryState === undefined ? '' : node.retryState) })
        return
      }
      if (kind === 'turn-max-tokens') {
        blocks.push({ key: 'm' + seq, kind: 'note', label: text().block.note, text: 'max tokens' })
        return
      }
      if (kind === 'compaction') {
        blocks.push({ key: 'p' + seq, kind: 'note', label: text().block.note, text: clip(String(node.summary === undefined || node.summary === null ? 'compaction' : node.summary), 300) })
        return
      }
      if (kind === 'command') {
        blocks.push({ key: 'k' + seq, kind: 'note', label: text().block.note, text: '/' + String(node.name === undefined ? '' : node.name) + ' ' + String(node.args === undefined || node.args === null ? '' : node.args) })
      }
    }

    /** Build the visible block list: settled tail, in-flight reply, running calls. */
    function buildBlocks(chat, config) {
      var blocks = []
      if (chat === null || chat === undefined) return blocks
      var legacy = chat.legacy
      var nodes = legacy === null || legacy === undefined ? null : legacy.nodes
      if (Array.isArray(nodes)) {
        for (var i = 0; i < nodes.length; i++) pushNode(blocks, nodes[i], config)
      }
      var partial = legacy === null || legacy === undefined ? null : legacy.partial
      if (partial !== null && partial !== undefined && Array.isArray(partial.blocks)) {
        for (var j = 0; j < partial.blocks.length; j++) {
          var block = partial.blocks[j]
          if (block === null || typeof block !== 'object') continue
          if (block.kind === 'text' && typeof block.text === 'string' && block.text.trim() !== '') {
            blocks.push({ key: 'q' + j, kind: 'assistant', streaming: true, text: block.text })
          } else if (block.kind === 'reasoning' && config.showReasoning && typeof block.text === 'string' && block.text.trim() !== '') {
            blocks.push({ key: 'qr' + j, kind: 'reasoning', streaming: true, text: block.text })
          } else if (block.kind === 'tool-call') {
            var args = parseArgs(block.argsRaw)
            blocks.push({
              key: 'qt' + j, kind: 'tool', name: block.name, args: args, argsRaw: block.argsRaw,
              hint: argsHint(args, block.argsRaw, block.name), output: null, state: 'running', duration: null,
            })
          }
        }
      }
      var running = legacy === null || legacy === undefined ? null : legacy.runningCalls
      if (Array.isArray(running)) {
        for (var k = 0; k < running.length; k++) {
          var call = running[k]
          if (call === null || call === undefined) continue
          var liveArgs = parseArgs(call.argsRaw)
          blocks.push({
            key: 'run' + String(call.callId === undefined ? k : call.callId), kind: 'tool', name: call.name,
            args: liveArgs, argsRaw: call.argsRaw, hint: argsHint(liveArgs, call.argsRaw, call.name),
            output: null, state: 'running', duration: null,
          })
        }
      }
      return blocks
    }

    /** The product's own status mark when the module table serves it. */
    function statusDot(state) {
      var P = primitives()
      if (state !== 'idle' && P !== null && component(P.StateDot)) {
        return el('span', { className: 'dshcp-dot' }, el(P.StateDot, { state: state, size: 10 }))
      }
      return el('span', { className: 'dshcp-dot', 'data-state': state })
    }

    /** One primitive icon, or the given text glyph when the table lacks it. */
    function icon(name, glyph, className) {
      var P = primitives()
      if (P !== null && component(P[name])) return el(P[name], { className: className })
      return el('span', { className: className }, glyph)
    }

    /** A 13px pushpin for the pane pin toggle (the primitive set has none). */
    function PinIcon(props) {
      return el('svg', {
        className: props.className, width: 13, height: 13, viewBox: '0 0 16 16',
        fill: 'none', 'aria-hidden': 'true',
      }, el('path', {
        d: 'M9.8 1.6 14.4 6.2 12.5 6.9 9.9 9.5 9.5 13 6.5 10 3.2 13.3 2.7 12.8 6 9.5 3 6.5 6.5 6.1 9.1 3.5 Z',
        stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round', strokeLinecap: 'round',
      }))
    }

    /** One sent user or steering message. */
    function UserBlock(props) {
      var P = primitives()
      var row = props.row
      var inner = P !== null && component(P.MessageText)
        ? el(P.MessageText, { text: row.text })
        : el('div', { className: 'dshcp-plainText' }, row.text)
      return el('div', { className: 'dshcp-msgUser' },
        row.label === undefined ? null : el('span', { key: 'label', className: 'dshcp-msgLabel' }, row.label),
        inner,
      )
    }

    /** One assistant reply: product markdown, live while it streams. */
    function AssistantBlock(props) {
      var P = primitives()
      var row = props.row
      if (P !== null && component(P.MarkdownText)) {
        return el('div', {
          className: 'dshcp-md',
          'data-streaming': row.streaming === true ? '1' : undefined,
          'data-interim': row.interim === true ? '1' : undefined,
        }, el(P.MarkdownText, { text: row.text, streaming: row.streaming === true, labels: mdLabels() }))
      }
      return el('div', { className: 'dshcp-plainText', 'data-streaming': row.streaming === true ? '1' : undefined }, row.text)
    }

    /** One reasoning block, folded behind the product's disclosure chrome. */
    function ReasoningBlock(props) {
      var P = primitives()
      var pair = React.useState(false)
      var open = pair[0]
      var setOpen = pair[1]
      var row = props.row
      var preview = clip(row.text, 150)
      var body = el('div', { className: 'dshcp-reasonBody', 'data-streaming': row.streaming === true ? '1' : undefined }, row.text)
      if (P !== null && component(P.DisclosureRow)) {
        return el('div', { className: 'dshcp-fold' }, el(P.DisclosureRow, {
          icon: icon('IconThinkOutline14', '✳', 'dshcp-glyph'),
          title: text().block.reasoning,
          open: open,
          expandable: true,
          onToggle: function () { setOpen(!open) },
          expandOnRowClick: true,
          collapsedContent: el('span', { className: 'dshcp-foldHint' }, preview),
          children: body,
        }))
      }
      return body
    }

    /** Terminal-block props for a shell call, or null for the generic path. */
    function terminalOf(row, cwd) {
      var P = primitives()
      if (P === null || !component(P.TerminalBlock)) return null
      if (row.name !== 'bash' && row.name !== 'pwsh') return null
      if (row.state === 'error') return null
      var args = row.args
      if (args === null) return null
      if (typeof args.command !== 'string' || args.command.trim() === '') return null
      if (args.run_in_background === true) return null
      var workdir = typeof args.workdir === 'string' && args.workdir !== '' ? args.workdir : cwd
      var base = { command: args.command, cwd: typeof workdir === 'string' && workdir !== '' ? workdir : undefined }
      if (row.state === 'running') return Object.assign(base, { running: true })
      var status = parseExitStatus(typeof row.output === 'string' ? row.output : '')
      return Object.assign(base, {
        running: false,
        output: status.output,
        exitCode: status.exitCode,
        signal: status.signal,
      })
    }

    /** One tool call: a folded card that opens into the product's own body. */
    function ToolBlock(props) {
      var P = primitives()
      var row = props.row
      var pair = React.useState(false)
      var open = pair[0]
      var setOpen = pair[1]
      var expandable = typeof row.output === 'string' && row.output !== ''
      var dotState = row.state === 'running' ? 'ongoing' : row.state === 'error' ? 'error' : 'done'
      var trailing = [
        el('span', { key: 'hint', className: 'dshcp-toolHint' }, row.hint),
        row.duration === null || row.duration === undefined || row.duration < 400
          ? null
          : el('span', { key: 'dur', className: 'dshcp-toolDur' }, formatDuration(row.duration)),
      ]
      var terminal = props.terminal
      var body = terminal !== null
        ? el(P.TerminalBlock, Object.assign({}, terminal, { maxLines: 24, labels: termLabels(), className: 'dshcp-terminal' }))
        : el('pre', { className: 'dshcp-pre', 'data-error': row.state === 'error' ? '1' : undefined },
          expandable ? row.output : text().block.empty)
      var head = P !== null && component(P.DisclosureRow)
        ? el(P.DisclosureRow, {
          icon: statusDot(dotState),
          title: row.name,
          open: open,
          expandable: expandable,
          onToggle: function () { setOpen(!open) },
          expandOnRowClick: true,
          previewChevron: true,
          collapsedContent: trailing,
          children: body,
        })
        : el('div', { className: 'dshcp-toolFallback' },
          statusDot(dotState),
          el('span', { className: 'dshcp-toolName' }, row.name),
          trailing,
          expandable ? el('button', {
            key: 'toggle', type: 'button', className: 'dshcp-iconBtn', onClick: function () { setOpen(!open) },
          }, open ? '−' : '+') : null,
          open ? body : null,
        )
      return el('div', { className: 'dshcp-tool', 'data-state': row.state }, head)
    }

    /** A settled failure or a log-only note. */
    function NoteBlock(props) {
      var row = props.row
      return el('div', { className: 'dshcp-note' },
        el('span', { key: 'label', className: 'dshcp-noteLabel' }, row.label === undefined ? text().block.note : row.label),
        el('span', { key: 'text', className: 'dshcp-noteText' }, row.text),
      )
    }

    /** Terminal failure of a turn. */
    function ErrorBlock(props) {
      var row = props.row
      return el('div', { className: 'dshcp-error' },
        icon('IconWarningOutline16', '!', 'dshcp-glyph'),
        el('span', { key: 'text', className: 'dshcp-errorText' }, row.text === '' ? text().block.failed : row.text),
      )
    }

    /** Dispatch one block to its renderer. */
    function renderBlock(block, cwd) {
      if (block.kind === 'user') return el(UserBlock, { key: block.key, row: block })
      if (block.kind === 'assistant') return el(AssistantBlock, { key: block.key, row: block })
      if (block.kind === 'reasoning') return el(ReasoningBlock, { key: block.key, row: block })
      if (block.kind === 'tool') return el(ToolBlock, { key: block.key, row: block, terminal: terminalOf(block, cwd) })
      if (block.kind === 'error') return el(ErrorBlock, { key: block.key, row: block })
      return el(NoteBlock, { key: block.key, row: block })
    }

    /** One pane: header facts plus its live feed. */
    function Pane(props) {
      var hub = props.hub
      var id = props.id
      var list = props.list
      var config = props.config
      var currentId = props.currentId
      var pending = props.pending
      var index = props.index
      var pinned = config.paneIds[index] === id
      var view = hub.read(id)
      var scroller = React.useRef(null)
      var atBottom = React.useRef(true)
      var signature = React.useRef('')
      // Stopping a turn from a pane is destructive on a small target: the first
      // press arms the button and it drops back after three seconds.
      var stopState = React.useState(false)
      var stopArmed = stopState[0]
      var setStopArmed = stopState[1]

      React.useEffect(function () {
        hub.want(id)
      }, [hub, id])

      React.useEffect(function () {
        if (!stopArmed) return undefined
        var timer = setTimeout(function () { setStopArmed(false) }, 3000)
        return function () { clearTimeout(timer) }
      }, [stopArmed])

      var summary = list.byId[id]
      var cwd = summary === undefined ? undefined : summary.cwd
      var children = childIndex(list)
      var live = runningDescendants(children, id)
      var jobs = jobsOf(list, id)
      var liveJobs = []
      for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].status === 'running' || jobs[i].status === 'stopping') liveJobs.push(jobs[i])
      }
      var session = view.session
      var chat = view.chat
      var facts = turnFacts(chat)
      var blocks = buildBlocks(chat, config)
      var visible = blocks.length > config.tail ? blocks.slice(blocks.length - config.tail) : blocks
      var running = session !== null && session !== undefined && session.running === true
      var openState = session === null || session === undefined ? null : session.openState
      var waiting = pending !== null && pending !== undefined && pending.get(id) !== undefined
      var failed = session !== null && session !== undefined && session.lastAgentError !== null && session.lastAgentError !== undefined
      var dotState = waiting ? 'warning' : running ? 'ongoing' : failed ? 'error' : 'idle'
      // The mark is colour-only, so it carries its state as text for hovers and
      // screen readers (the primitive dot itself is aria-hidden).
      var dotLabel = dotState === 'ongoing' ? text().pane.running
        : dotState === 'warning' ? text().pane.waiting
          : dotState === 'error' ? text().pane.error
            : text().pane.idle
      var elapsed = running && facts.start !== null ? Date.now() - facts.start : (facts.end !== null && facts.start !== null ? facts.end - facts.start : null)

      var last = visible.length > 0 ? visible[visible.length - 1] : null
      var newest = last === null ? '' : last.key + ':' + String(last.text === undefined ? (last.output === undefined ? '' : String(last.output).length) : last.text.length)
      React.useEffect(function () {
        var node = scroller.current
        if (node === null) return
        if (signature.current === newest) return
        signature.current = newest
        if (config.follow && atBottom.current) node.scrollTop = node.scrollHeight
      })

      var badges = []
      if (id === currentId) badges.push({ key: 'cur', tone: 'Current', label: text().pane.current })
      if (waiting) badges.push({ key: 'wait', tone: 'Warn', label: text().pane.waiting })
      if (failed && !waiting) badges.push({ key: 'err', tone: 'Error', label: text().pane.error })
      if (live.length > 0) badges.push({ key: 'sub', tone: '', label: text().pane.subagents(live.length) })
      if (config.showJobs && liveJobs.length > 0) badges.push({ key: 'job', tone: '', label: text().pane.jobs(liveJobs.length) })
      if (facts.tokens !== null) badges.push({ key: 'tok', tone: '', label: text().pane.tokens + ' ' + formatTokens(facts.tokens) })
      if (elapsed !== null) badges.push({ key: 'el', tone: '', label: formatDuration(elapsed) })

      var P = primitives()
      var options = orderedIds(list, currentId)
      var head = el('div', { className: 'dshcp-paneHead' },
        el('span', {
          key: 'dot', className: 'dshcp-dotBox', role: 'img', title: dotLabel, 'aria-label': dotLabel,
        }, statusDot(dotState)),
        el('select', {
          key: 'pick',
          className: 'dshcp-pick',
          'aria-label': text().pane.pick,
          title: summary === undefined ? id : summary.displayTitle + '\n' + String(summary.cwd === undefined ? '' : summary.cwd),
          value: id,
          onChange: function (event) { assignSlot(config, index, event.target.value) },
        }, options.map(function (optionId) {
          var option = list.byId[optionId]
          var label = (option === undefined ? optionId : option.displayTitle)
            + (option !== undefined && option.origin === 'subagent' ? ' · sub' : '')
            + (option !== undefined && option.running === true ? ' ●' : '')
          return el('option', { key: optionId, value: optionId }, label)
        })),
        el('span', { key: 'caret', className: 'dshcp-caret' }, '▾'),
        el('span', { key: 'actions', className: 'dshcp-actions' },
          el('button', {
            key: 'pin', type: 'button', className: 'dshcp-iconBtn',
            'data-on': pinned ? '1' : undefined, title: pinned ? text().pane.unpin : text().pane.pin,
            onClick: function () { assignSlot(config, index, pinned ? '' : id) },
          }, el(PinIcon, { className: 'dshcp-ico' })),
          el('button', {
            key: 'focus', type: 'button', className: 'dshcp-iconBtn', title: text().pane.focus,
            onClick: function () { props.onFocus(id) },
          }, icon('IconFullscreenOutline16', '⤢', 'dshcp-ico')),
          running ? el('button', {
            key: 'stop',
            type: 'button',
            className: stopArmed ? 'dshcp-iconBtn dshcp-stop dshcp-stopArmed' : 'dshcp-iconBtn dshcp-stop',
            title: stopArmed ? text().pane.stopConfirm : text().pane.stop,
            onClick: function () {
              if (!stopArmed) {
                setStopArmed(true)
                return
              }
              setStopArmed(false)
              props.onStop(id)
            },
          }, stopArmed ? el('span', { className: 'dshcp-stopText' }, text().pane.stopConfirm) : icon('IconStopFill16', '■', 'dshcp-ico')) : null,
        ),
      )

      var meta = el('div', { className: 'dshcp-paneMeta' },
        el('span', { key: 'ws', className: 'dshcp-ws' }, summary === undefined || summary.cwd === undefined ? '' : baseName(summary.cwd) || ''),
        badges.map(function (badge) {
          var tone = badge.tone === '' ? '' : ' dshcp-badge' + badge.tone
          return P !== null && component(P.Pill)
            ? el(P.Pill, { key: badge.key, className: 'dshcp-badge' + tone }, badge.label)
            : el('span', { key: badge.key, className: 'dshcp-badge' + tone }, badge.label)
        }),
      )

      var body = null
      if (session === null || session === undefined || openState === 'cold' || openState === 'loading') {
        body = el('div', { key: 'hint', className: 'dshcp-feedState' },
          el('span', { key: 'spin', className: 'dshcp-spin' }), text().pane.loading)
      } else if (openState === 'error') {
        body = el('div', { key: 'hint', className: 'dshcp-feedState dshcp-feedError' }, text().pane.loadFailed)
      } else if (visible.length === 0) {
        body = el('div', { key: 'hint', className: 'dshcp-feedState' }, text().pane.blank)
      } else {
        body = el('div', { key: 'flow', className: 'dshcp-flow' }, visible.map(function (block) {
          return renderBlock(block, cwd)
        }))
      }

      return el('div', { className: 'dshcp-pane', 'data-current': id === currentId ? '1' : undefined },
        head,
        meta,
        el('div', {
          key: 'feed',
          className: 'dshcp-feed',
          ref: scroller,
          onScroll: function (event) {
            var node = event.target
            atBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 24
          },
        }, body),
      )
    }

    /** A slot with nothing assigned. */
    function EmptyPane(props) {
      var list = props.list
      var currentId = props.currentId
      var options = orderedIds(list, currentId)
      return React.createElement('div', { className: 'dshcp-pane dshcp-paneEmpty' },
        React.createElement('div', { className: 'dshcp-paneHead' },
          React.createElement('span', { key: 'dot', className: 'dshcp-dot', 'data-state': 'idle' }),
          React.createElement('select', {
            key: 'pick',
            className: 'dshcp-pick',
            'aria-label': text().pane.pick,
            value: '',
            onChange: function (event) {
              if (event.target.value !== '') assignSlot(props.config, props.index, event.target.value)
            },
          }, [React.createElement('option', { key: '', value: '' }, text().pane.empty)].concat(options.map(function (optionId) {
            var option = list.byId[optionId]
            var label = (option === undefined ? optionId : option.displayTitle)
              + (option !== undefined && option.origin === 'subagent' ? ' · sub' : '')
              + (option !== undefined && option.running === true ? ' ●' : '')
            return React.createElement('option', { key: optionId, value: optionId }, label)
          }))),
          React.createElement('span', { key: 'caret', className: 'dshcp-caret' }, '▾'),
        ),
      )
    }

    /** The toolbar above the grid. */
    function Toolbar(props) {
      var config = props.config
      var list = props.list
      var stats = props.stats
      var buttons = COLUMN_CHOICES.map(function (count) {
        return React.createElement('button', {
          key: 'c' + count,
          type: 'button',
          className: 'dshcp-chip',
          'data-on': config.columns === count ? '1' : undefined,
          onClick: function () { writeConfig([{ op: 'set', path: ['columns'], value: count }]) },
        }, String(count))
      })
      return React.createElement('div', { className: 'dshcp-bar' },
        React.createElement('span', { key: 'label', className: 'dshcp-barLabel' }, text().bar.panes),
        React.createElement('span', { key: 'cols', className: 'dshcp-chips' }, buttons),
        React.createElement('button', {
          key: 'auto', type: 'button', className: 'dshcp-chip dshcp-chipWide',
          'data-on': config.autoFill ? '1' : undefined,
          title: text().page.autoFillHint,
          onClick: function () { writeConfig([{ op: 'set', path: ['autoFill'], value: !config.autoFill }]) },
        }, text().bar.auto),
        React.createElement('button', {
          key: 'reset', type: 'button', className: 'dshcp-chip dshcp-chipWide',
          onClick: function () {
            runtime.auto = []
            writeConfig([{ op: 'set', path: ['paneIds'], value: [] }])
          },
        }, text().bar.reset),
        React.createElement('span', { key: 'spacer', className: 'dshcp-spacer' }),
        React.createElement('span', {
          key: 'summary',
          className: 'dshcp-barHint',
        }, stats.running > 0 ? text().bar.tasks(stats.running, stats.total) : text().bar.idle),
      )
    }

    /** The Conversation View entry: the whole pane grid. */
    function PanesView(props) {
      var hub = runtime.hub
      var config = useConfig()
      useHubVersion(hub)
      var list = props.useSessions(function (state) { return state })
      var pending = props.useSessionPendingInteraction === undefined
        ? null
        : props.useSessionPendingInteraction(function (value) { return value })
      var currentId = list.current

      var slots = resolvePanes(list, config, currentId)

      React.useEffect(function () {
        hub.reconcile(list.byId)
        var shown = []
        for (var i = 0; i < slots.length; i++) {
          if (slots[i] !== undefined) shown.push(slots[i])
        }
        hub.setWanted(shown)
      }, [hub, list, slots.join('|')])

      // Mount-only: the feed set is released when the View unmounts, not on
      // every re-run of the effect above (its deps change with the list).
      React.useEffect(function () {
        return function () { hub.setWanted([]) }
      }, [hub])

      var stats = { running: 0, total: list.ids.length }
      var children = childIndex(list)
      for (var i = 0; i < list.ids.length; i++) {
        var summary = list.byId[list.ids[i]]
        var liveJobs = jobsOf(list, list.ids[i])
        var working = false
        for (var j = 0; j < liveJobs.length; j++) {
          if (liveJobs[j].status === 'running' || liveJobs[j].status === 'stopping') working = true
        }
        if (summary !== undefined && (summary.running === true || working || runningDescendants(children, list.ids[i]).length > 0)) stats.running++
      }

      var panes = []
      for (var index = 0; index < config.columns; index++) {
        var id = slots[index]
        if (id === undefined) {
          panes.push(React.createElement(EmptyPane, {
            key: 'empty' + index, list: list, config: config, currentId: currentId, index: index,
          }))
        } else {
          panes.push(React.createElement(Pane, {
            key: id, hub: hub, id: id, list: list, config: config, currentId: currentId,
            pending: pending, index: index,
            onFocus: function (target) { runtime.open(target) },
            onStop: function (target) { runtime.stop(hub, target) },
          }))
        }
      }

      return React.createElement('div', {
        className: 'dshcp-root',
        'data-density': config.density,
        'data-conversation-composer-overlay': '',
      },
        React.createElement(Toolbar, { key: 'bar', config: config, list: list, stats: stats }),
        React.createElement('div', {
          key: 'grid',
          className: 'dshcp-grid',
          'data-columns': String(config.columns),
        }, panes),
      )
    }

    /** One settings row with a switch. */
    function switchRow(page, config, field, hint, disabled) {
      return React.createElement('div', { key: field, className: 'dshcp-setRow', 'data-disabled': disabled ? '1' : undefined },
        React.createElement('div', { key: 'text', className: 'dshcp-setText' },
          React.createElement('span', { key: 'label', className: 'dshcp-setLabel' }, page[field]),
          hint === undefined ? null : React.createElement('span', { key: 'hint', className: 'dshcp-setHint' }, hint),
        ),
        React.createElement('button', {
          key: 'toggle',
          type: 'button',
          className: 'dshcp-switch',
          'data-on': config[field] ? '1' : undefined,
          disabled: disabled === true,
          onClick: function () { writeConfig([{ op: 'set', path: [field], value: !config[field] }]) },
        }, React.createElement('span', { className: 'dshcp-knob' })),
      )
    }

    /** One settings row with a numeric stepper. */
    function numberRow(page, config, field, unit, min, max) {
      return React.createElement('div', { key: field, className: 'dshcp-setRow' },
        React.createElement('div', { key: 'text', className: 'dshcp-setText' },
          React.createElement('span', { key: 'label', className: 'dshcp-setLabel' }, page[field]),
        ),
        React.createElement('div', { key: 'control', className: 'dshcp-setControl' },
          React.createElement('button', {
            key: 'minus', type: 'button', className: 'dshcp-chip', disabled: config[field] <= min,
            onClick: function () { writeConfig([{ op: 'set', path: [field], value: Math.max(min, config[field] - 1) }]) },
          }, '−'),
          React.createElement('span', { key: 'value', className: 'dshcp-setValue' }, String(config[field]) + (unit === undefined ? '' : unit)),
          React.createElement('button', {
            key: 'plus', type: 'button', className: 'dshcp-chip', disabled: config[field] >= max,
            onClick: function () { writeConfig([{ op: 'set', path: [field], value: Math.min(max, config[field] + 1) }]) },
          }, '+'),
        ),
      )
    }

    /** The Settings → Concurrent panes page. */
    function SettingsSection() {
      var config = useConfig()
      var page = text().page
      var sessions = runtime.hub === null ? null : runtime.hub.listSnapshot()
      return React.createElement('div', { className: 'dshcp-page' },
        React.createElement('h2', { key: 'h', className: 'dshcp-h1' }, page.title),
        React.createElement('p', { key: 'd', className: 'dshcp-intro' }, page.desc),
        React.createElement('div', { key: 'card', className: 'dshcp-card' },
          React.createElement('div', { key: 'layout', className: 'dshcp-setRow' },
            React.createElement('div', { key: 'text', className: 'dshcp-setText' },
              React.createElement('span', { key: 'label', className: 'dshcp-setLabel' }, page.columns),
            ),
            React.createElement('div', { key: 'control', className: 'dshcp-setControl' },
              COLUMN_CHOICES.map(function (count) {
                return React.createElement('button', {
                  key: 'c' + count, type: 'button', className: 'dshcp-chip',
                  'data-on': config.columns === count ? '1' : undefined,
                  onClick: function () { writeConfig([{ op: 'set', path: ['columns'], value: count }]) },
                }, String(count))
              }),
            ),
          ),
          switchRow(page, config, 'autoFill', page.autoFillHint),
          React.createElement('div', { key: 'density', className: 'dshcp-setRow' },
            React.createElement('div', { key: 'text', className: 'dshcp-setText' },
              React.createElement('span', { key: 'label', className: 'dshcp-setLabel' }, page.density),
            ),
            React.createElement('div', { key: 'control', className: 'dshcp-setControl' },
              ['comfy', 'compact'].map(function (value) {
                return React.createElement('button', {
                  key: value, type: 'button', className: 'dshcp-chip dshcp-chipWide',
                  'data-on': config.density === value ? '1' : undefined,
                  onClick: function () { writeConfig([{ op: 'set', path: ['density'], value: value }]) },
                }, page[value])
              }),
            ),
          ),
          numberRow(page, config, 'tail', page.tailUnit, 8, 200),
          switchRow(page, config, 'showReasoning', page.showReasoningHint),
          switchRow(page, config, 'showJobs'),
          switchRow(page, config, 'follow', page.followHint),
        ),
        React.createElement('div', { key: 'pinned', className: 'dshcp-card' },
          React.createElement('div', { key: 'head', className: 'dshcp-cardHead' },
            React.createElement('span', { key: 't', className: 'dshcp-cardTitle' }, page.pinned),
            React.createElement('span', { key: 'h', className: 'dshcp-setHint' }, page.pinnedHint),
          ),
          React.createElement('div', { key: 'body', className: 'dshcp-pinned' },
            config.paneIds.filter(function (id) { return typeof id === 'string' && id !== '' }).length === 0
              ? React.createElement('span', { key: 'none', className: 'dshcp-setHint' }, '—')
              : config.paneIds.map(function (id, index) {
                if (typeof id !== 'string' || id === '') return null
                return React.createElement('button', {
                  key: String(index) + id, type: 'button', className: 'dshcp-chip',
                  onClick: function () { assignSlot(config, index, '') },
                }, (sessions !== null && sessions.byId[id] !== undefined ? sessions.byId[id].displayTitle : id) + ' ✕')
              }),
          ),
        ),
      )
    }

    /* ------------------------------------------------------------------ */
    /* stylesheet                                                          */
    /* ------------------------------------------------------------------ */

    /** The pane stylesheet: product rhythm, one narrow column per pane. */
    function pageCss() {
      // Markdown overrides need two classes to outrank the primitive's own
      // `.markdown h1` rules regardless of stylesheet order.
      var MD = '.dshcp-md '
      var M = '.dshcp-pane ' + MD
      return [
        /* ---- shell ---- */
        '.dshcp-root{display:flex;flex-direction:column;height:100%;min-height:0;width:100%;box-sizing:border-box;',
        'color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);overflow:hidden;}',
        '.dshcp-bar{display:flex;align-items:center;gap:8px;flex:none;padding:7px 14px;',
        'border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px;color:var(--dsw-alias-label-secondary);}',
        '.dshcp-barLabel{color:var(--dsw-alias-label-primary);font-weight:600;}',
        '.dshcp-barHint{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));white-space:nowrap;',
        'overflow:hidden;text-overflow:ellipsis;}',
        '.dshcp-spacer{flex:1 1 auto;min-width:0;}',
        '.dshcp-chips,.dshcp-setControl{display:flex;gap:4px;align-items:center;}',
        '.dshcp-chip{font:inherit;font-size:11.5px;line-height:1;padding:5px 9px;border-radius:7px;cursor:pointer;',
        'border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);}',
        '.dshcp-chip:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);}',
        '.dshcp-chip[data-on="1"]{background:var(--dsw-alias-brand-primary);border-color:transparent;',
        'color:var(--dsw-alias-bg-layer-1);font-weight:600;}',
        '.dshcp-chip:disabled{opacity:.4;cursor:default;}',
        '.dshcp-chipWide{padding:5px 11px;}',
        /* ---- grid ---- */
        '.dshcp-grid{flex:1 1 auto;min-height:0;display:grid;gap:10px;padding:10px 14px;',
        'padding-bottom:calc(var(--dsh-composer-height,152px) + 14px);overflow:hidden;}',
        '.dshcp-grid[data-columns="1"]{grid-template-columns:minmax(0,1fr);}',
        '.dshcp-grid[data-columns="2"]{grid-template-columns:repeat(2,minmax(0,1fr));}',
        '.dshcp-grid[data-columns="3"]{grid-template-columns:repeat(3,minmax(0,1fr));}',
        '.dshcp-grid[data-columns="4"]{grid-template-columns:repeat(4,minmax(0,1fr));}',
        '.dshcp-pane{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden;border-radius:14px;',
        'border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);}',
        '.dshcp-pane[data-current="1"]{border-color:var(--dsw-alias-brand-primary);}',
        '.dshcp-paneEmpty{border-style:dashed;background:transparent;}',
        /* ---- pane header ---- */
        '.dshcp-paneHead{display:flex;align-items:center;gap:7px;flex:none;min-width:0;padding:9px 11px 3px;}',
        '.dshcp-dotBox{flex:none;display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;}',
        '.dshcp-dot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-label-tertiary,',
        'var(--dsw-alias-label-secondary));opacity:.45;}',
        '.dshcp-dot[data-state="ongoing"]{background:var(--dsw-alias-state-success-primary);opacity:1;}',
        '.dshcp-dot[data-state="warning"]{background:var(--dsw-alias-state-warn-primary);opacity:1;}',
        '.dshcp-dot[data-state="error"]{background:var(--dsw-alias-state-error-primary);opacity:1;}',
        '.dshcp-pick{flex:1 1 auto;min-width:0;font:inherit;font-size:13px;font-weight:600;color:inherit;',
        'background:transparent;border:0;appearance:none;-webkit-appearance:none;cursor:pointer;padding:0;',
        'text-overflow:ellipsis;overflow:hidden;white-space:nowrap;}',
        '.dshcp-pick:focus{outline:none;color:var(--dsw-alias-brand-primary);}',
        '.dshcp-pick option{color:#16181d;background:#fff;}',
        '.dshcp-caret{flex:none;font-size:9px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-actions{flex:none;display:flex;gap:1px;opacity:.35;transition:opacity .15s;}',
        '.dshcp-pane:hover .dshcp-actions,.dshcp-actions:focus-within{opacity:1;}',
        '.dshcp-iconBtn{display:inline-flex;align-items:center;justify-content:center;font:inherit;font-size:11px;',
        'line-height:1;width:22px;height:22px;border-radius:7px;cursor:pointer;border:0;background:transparent;',
        'color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-iconBtn:hover{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);}',
        '.dshcp-iconBtn[data-on="1"]{color:var(--dsw-alias-brand-primary);}',
        '.dshcp-ico{display:block;}',
        '.dshcp-stop:hover{color:var(--dsw-alias-state-error-primary);}',
        '.dshcp-stopArmed{color:var(--dsw-alias-state-error-primary);width:auto;padding:0 6px;}',
        '.dshcp-stopText{font-size:10.5px;font-weight:600;white-space:nowrap;}',
        /* ---- pane meta strip ---- */
        '.dshcp-paneMeta{display:flex;align-items:center;gap:6px;flex:none;min-width:0;padding:0 11px 8px;',
        'font-size:11px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));overflow:hidden;}',
        '.dshcp-ws{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:38%;}',
        '.dshcp-paneMeta .dshcp-badge{display:inline-flex;align-items:center;flex:none;height:18px;padding:0 7px;',
        'border-radius:9px;font-size:11px;line-height:18px;white-space:nowrap;',
        'background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-paneMeta .dshcp-badgeCurrent{color:var(--dsw-alias-brand-primary);',
        'box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary);background:transparent;font-weight:600;}',
        '.dshcp-paneMeta .dshcp-badgeWarn{color:var(--dsw-alias-state-warn-primary);background:transparent;',
        'box-shadow:inset 0 0 0 1px var(--dsw-alias-state-warn-primary);font-weight:600;}',
        '.dshcp-paneMeta .dshcp-badgeError{color:var(--dsw-alias-state-error-primary);background:transparent;',
        'box-shadow:inset 0 0 0 1px var(--dsw-alias-state-error-primary);font-weight:600;}',
        /* ---- feed ---- */
        '.dshcp-feed{flex:1 1 auto;min-height:0;overflow-y:auto;padding:10px 12px 14px;scrollbar-gutter:stable;}',
        '.dshcp-flow{display:flex;flex-direction:column;gap:10px;}',
        '.dshcp-feedState{display:flex;align-items:center;justify-content:center;gap:8px;padding:28px 8px;',
        'font-size:12px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-feedError{color:var(--dsw-alias-state-error-primary);}',
        '.dshcp-spin{width:12px;height:12px;border-radius:50%;border:1.5px solid var(--dsw-alias-border-l2);',
        'border-top-color:transparent;animation:dshcpSpin .8s linear infinite;}',
        '@keyframes dshcpSpin{to{transform:rotate(360deg)}}',
        '@keyframes dshcpPulse{0%,100%{opacity:1}50%{opacity:.2}}',
        /* ---- user message ---- */
        '.dshcp-msgUser{border-radius:12px;background:var(--dsw-specific-bubble,var(--dsw-alias-bg-layer-1));',
        'box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);padding:8px 12px 9px;}',
        '.dshcp-msgLabel{display:block;margin-bottom:3px;font-size:10px;letter-spacing:.05em;',
        'color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-msgUser>div{font-size:13px;line-height:1.62;white-space:pre-wrap;overflow-wrap:anywhere;}',
        '.dshcp-plainText{font-size:13px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere;}',
        /* ---- assistant markdown ---- */
        '.dshcp-md{min-width:0;}',
        // The renderer's own class is CSS-module hashed, so the font override
        // rides the wrapper's direct child instead of guessing at its name.
        '.dshcp-pane .dshcp-md>div{font-size:13px;line-height:1.68;}',
        M + 'h1,' + M + 'h2,' + M + 'h3{font-size:14.5px;line-height:1.45;margin:14px 0 8px;}',
        M + 'h4,' + M + 'h5,' + M + 'h6{font-size:13px;line-height:1.5;margin:12px 0 6px;}',
        M + 'p{margin:0 0 8px;}',
        M + 'ul,' + M + 'ol{margin:6px 0 8px;padding-left:20px;}',
        M + 'li{margin:2px 0;}',
        M + 'pre{font-size:11.5px;line-height:1.55;border-radius:8px;}',
        M + 'code{font-size:11.5px;}',
        M + 'blockquote{margin:8px 0;padding-left:10px;}',
        M + 'table{font-size:12px;}',
        M + 'hr{margin:12px 0;}',
        M + 'img{max-width:100%;height:auto;}',
        '.dshcp-md[data-interim="1"]>div{color:var(--dsw-alias-label-secondary);}',
        '.dshcp-md[data-streaming="1"]>div> :last-child::after{content:"";display:inline-block;',
        'width:7px;height:14px;margin-left:3px;vertical-align:-2px;border-radius:1.5px;',
        'background:var(--dsw-alias-brand-primary);animation:dshcpPulse 1s steps(2,end) infinite;}',
        /* ---- folded rows (tool calls, reasoning) ---- */
        '.dshcp-tool,.dshcp-fold{border-radius:10px;border:1px solid var(--dsw-alias-border-l1);',
        'background:var(--dsw-alias-bg-layer-1);padding:0 8px;overflow:hidden;}',
        '.dshcp-fold{background:transparent;border-style:dashed;}',
        '.dshcp-tool[data-state="error"]{border-color:var(--dsw-alias-state-error-primary);}',
        '.dshcp-toolHint{flex:1 1 auto;min-width:0;margin-left:10px;font-size:11.5px;overflow:hidden;',
        'text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-foldHint{flex:1 1 auto;min-width:0;margin-left:10px;font-size:11.5px;overflow:hidden;',
        'text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-toolDur{flex:none;margin-left:8px;font-size:10.5px;opacity:.75;',
        'color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-toolName{flex:none;font-size:13px;color:var(--dsw-alias-label-secondary);}',
        '.dshcp-toolFallback{display:flex;align-items:center;min-height:26px;}',
        '.dshcp-glyph{display:block;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-terminal{margin:2px 0 8px;}',
        '.dshcp-pre{margin:2px 0 8px;padding:8px 10px;border-radius:8px;max-height:280px;overflow:auto;',
        'background:var(--dsw-alias-markdown-code-block,var(--dsw-alias-bg-layer-2));',
        'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.55;',
        'white-space:pre-wrap;overflow-wrap:anywhere;}',
        '.dshcp-pre[data-error="1"]{color:var(--dsw-alias-state-error-primary);}',
        '.dshcp-reasonBody{padding:2px 8px 9px 24px;font-size:12px;line-height:1.62;white-space:pre-wrap;',
        'overflow-wrap:anywhere;color:var(--dsw-alias-label-secondary);}',
        /* ---- notes and failures ---- */
        '.dshcp-note{display:flex;gap:8px;align-items:baseline;padding:0 2px;font-size:11.5px;',
        'color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}',
        '.dshcp-noteLabel{flex:none;padding:0 6px;border-radius:6px;font-size:10.5px;line-height:16px;',
        'background:var(--dsw-alias-bg-layer-1);}',
        '.dshcp-noteText{min-width:0;white-space:pre-wrap;overflow-wrap:anywhere;}',
        '.dshcp-error{display:flex;gap:8px;align-items:flex-start;padding:7px 10px;border-radius:10px;',
        'background:var(--dsw-alias-bg-layer-1);box-shadow:inset 0 0 0 1px var(--dsw-alias-state-error-primary);',
        'color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.55;}',
        '.dshcp-errorText{min-width:0;white-space:pre-wrap;overflow-wrap:anywhere;}',
        /* ---- density ---- */
        '.dshcp-root[data-density="compact"] .dshcp-flow{gap:6px;}',
        '.dshcp-root[data-density="compact"] .dshcp-feed{padding:8px 10px 10px;}',
        '.dshcp-root[data-density="compact"] .dshcp-pane .dshcp-md>div{font-size:12px;line-height:1.55;}',
        '.dshcp-root[data-density="compact"] ' + MD + 'p{margin:0 0 6px;}',
        '.dshcp-root[data-density="compact"] .dshcp-msgUser{padding:6px 10px;border-radius:10px;}',
        '.dshcp-root[data-density="compact"] .dshcp-msgUser>div{font-size:12px;line-height:1.5;}',
        /* ---- settings page ---- */
        '.dshcp-page{display:flex;flex-direction:column;gap:14px;padding:4px 2px 24px;max-width:760px;}',
        '.dshcp-h1{font-size:17px;font-weight:600;margin:0;}',
        '.dshcp-intro{font-size:12.5px;line-height:1.7;color:var(--dsw-alias-label-secondary);margin:0;}',
        '.dshcp-card{display:flex;flex-direction:column;gap:2px;border:1px solid var(--dsw-alias-border-l1);',
        'border-radius:12px;padding:6px 14px;background:var(--dsw-alias-bg-layer-2);}',
        '.dshcp-cardHead{display:flex;flex-direction:column;gap:3px;padding:8px 0 10px;}',
        '.dshcp-cardTitle{font-size:13px;font-weight:600;}',
        '.dshcp-setRow{display:flex;align-items:center;gap:14px;padding:9px 0;',
        'border-top:1px solid var(--dsw-alias-border-l1);}',
        '.dshcp-setRow:first-child{border-top:0;}',
        '.dshcp-setRow[data-disabled="1"]{opacity:.45;}',
        '.dshcp-setText{display:flex;flex-direction:column;gap:2px;flex:1 1 auto;min-width:0;}',
        '.dshcp-setLabel{font-size:12.5px;}',
        '.dshcp-setHint{font-size:11.5px;color:var(--dsw-alias-label-secondary);line-height:1.5;}',
        '.dshcp-setValue{font-size:12px;min-width:44px;text-align:center;color:var(--dsw-alias-label-secondary);}',
        '.dshcp-switch{flex:none;width:38px;height:22px;border-radius:11px;cursor:pointer;',
        'border:1px solid var(--dsw-alias-border-l1);background:transparent;padding:2px;display:flex;align-items:center;}',
        '.dshcp-switch[data-on="1"]{background:var(--dsw-alias-brand-primary);border-color:transparent;justify-content:flex-end;}',
        '.dshcp-knob{width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-secondary);}',
        '.dshcp-switch[data-on="1"] .dshcp-knob{background:var(--dsw-alias-bg-layer-1);}',
        '.dshcp-pinned{display:flex;flex-wrap:wrap;gap:6px;padding:2px 0 10px;}',
      ].join('')
    }

    /**
     * Mount the Concurrent panes View, its stylesheet and its settings page.
     * @param {object} ctx - the client plugin context.
     */
    function apply(ctx) {
      var tag = null

      var scope = ctx.settingsScope.bind({ namespace: NS })
      runtime.scope = scope
      runtime.locale = ctx.locale
      setLanguage()
      runtime.hub = createHub(ctx)
      // The shell seeds the product's own UI primitives into the module table,
      // so a pane renders the shipped markdown renderer, state dots, pills and
      // terminal card instead of hand-rolled lookalikes. A miss degrades to the
      // plain fallbacks rather than failing the plugin.
      try {
        runtime.P = table('@deepseek-ai/dsh-client-ui-primitives')
      } catch (error) {
        runtime.P = null
        console.error('concurrent-panes: ui-primitives unavailable, using fallback chrome', error)
      }
      runtime.open = function (id) {
        var sessions = ctx.get('sessions')
        if (sessions === undefined) return
        try {
          sessions.open(id)
        } catch (error) {
          console.error('concurrent-panes: open failed', error)
        }
      }
      runtime.stop = function (hub, id) {
        var feed = hub.want(id)
        if (feed === null) return
        var result = null
        try {
          result = feed.session.cancel()
        } catch (error) {
          console.error('concurrent-panes: cancel failed', error)
          return
        }
        if (result !== null && result !== undefined && typeof result.then === 'function') {
          result.then(function (outcome) {
            if (outcome !== null && outcome !== undefined && outcome.ok === false) {
              console.error('concurrent-panes: cancel rejected: ' + String(outcome.error && outcome.error.message))
            }
          }, function (error) {
            console.error('concurrent-panes: cancel failed', error)
          })
        }
      }

      // The settings page lists pinned panes by title, so it reads the same
      // list snapshot the panes do.
      runtime.hub.listSnapshot = function () {
        var sessions = ctx.get('sessions')
        if (sessions === undefined || sessions.list === undefined) return null
        try {
          return sessions.list.getSnapshot()
        } catch (error) {
          return null
        }
      }

      ctx.effect(function () {
        tag = document.createElement('style')
        tag.setAttribute('data-dsh-concurrent-panes', 'css')
        tag.textContent = pageCss()
        document.head.appendChild(tag)
        return function () {
          if (tag !== null) {
            tag.remove()
            tag = null
          }
        }
      }, 'concurrent-panes: css')

      ctx.effect(function () {
        return ctx.locale.subscribe(function () {
          setLanguage()
          runtime.hub.bump()
        })
      }, 'concurrent-panes: locale')

      // A pane whose window failed to open (a transient transport failure, a
      // session that arrived after the first render) is retried slowly; the
      // stream itself does the rest.
      ctx.effect(function () {
        return ctx.interval(function () { runtime.hub.tick() }, TICK_MS)
      }, 'concurrent-panes: open retry')

      ctx.effect(function () {
        return function () { runtime.hub.dispose() }
      }, 'concurrent-panes: feeds')



      if (ctx.slots === undefined) {
        console.error('concurrent-panes: slots service unavailable')
        return
      }

      ctx.slots.inject('conversation.view', function () {
        return ctx.slots.register({
          name: 'conversation.view',
          id: 'panes',
          // After Chat (0) and before Trajectory's later seat, so the tab row
          // reads Chat · Panes · …
          order: 1,
          label: function () { return text().viewLabel },
          locale: NS,
        }, PanesView)
      })

      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'concurrent-panes',
          order: 24,
          label: function () { return text().page.sectionLabel },
        }, SettingsSection)
      })
    }

    module.exports = { name: name, inject: inject, apply: apply };
    return module.exports;
  }
});
