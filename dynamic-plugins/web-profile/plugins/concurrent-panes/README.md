# dsh-concurrent-panes

DeepSeek Harness Web GUI 的常驻插件：在对话区新增一个 **并发（Panes）** View，把 1~4 个会话并排铺开，
每个窗格实时流淌该会话自己的输出，用来同时盯住 dsh 里所有并发跑的活。

- 安装位置（dsh 实际加载的就是这里）：`~/.dsh/profiles/web/plugins/concurrent-panes/`
- 注册行：`~/.dsh/profiles/web/cordis.patch.yml` 的 `insert` 列表（`id: concurrent-panes`）
- 该 profile 是 `dsh.patchReload: live`，改完 patch 文件不用重启 dsh；**浏览器刷新一次**即生效
- 入口：会话头部标签页 `Chat | Panes | Trajectory | …`（`conversation.view` 列表槽位自动变成 tab）
- 设置：设置 → Concurrent panes（`settings.section` 整页），落盘在 `~/.dsh/settings.yaml` 的 `concurrent-panes:` 段

## 它显示什么

每个窗格（一个会话），**外观直接复用产品自带的 UI primitives**（`@deepseek-ai/dsh-client-ui-primitives`
是 shell 播进模块表的平台模块，静态插件 `require` 得到同一实例）：

| 区域 | 内容 | 用的产品件 |
| --- | --- | --- |
| 表头 | 状态点（运行中/等待确认/出错/空闲）、会话标题（**原生 select，点标题即换窗格内容**）、📌 钉住、⤢ 在 Chat 中打开、■ 停止（两段式） | `StateDot`、`IconFullscreenOutline16`、`IconStopFill16`、自绘 13px 图钉 |
| 表头第二行 | 工作区目录名、`current` / 等待确认 / 出错 / 子任务数 / 后台任务数 / token / 本轮耗时 | `Pill` |
| 正文 | **迷你对话流** | |
| 　· 用户消息 | 圆角气泡 + 角色小标签，正文用产品原文渲染器 | `MessageText` |
| 　· 助手回复 | 真 markdown：代码块（含语法高亮与复制按钮）、行内 code、列表、表格、公式；未写完时行尾带光标 | `MarkdownText`（`streaming`） |
| 　· 思考过程 | 虚线折叠行，默认收起 | `DisclosureRow` + `IconThinkOutline14` |
| 　· 工具调用 | 一行小卡片：状态点 + 工具名 + 参数摘要（bash 取 `description`）+ 耗时，点开是产品同款终端卡（含 Done/exit 徽标、Copy、行数折叠） | `DisclosureRow` + `TerminalBlock` |
| 　· 记录/错误 | 灰底小标签行 / 红框失败卡 | — |

工具条：窗格数 1/2/3/4、自动填充开关、重排、右侧「N 个任务运行中 · 共 M 个会话」。

**降级路径**：模块表取不到 primitives 时，同一套结构退化成纯文本 + 自绘圆点（`console.error` 一条），
插件本身不会因为平台件缺失而挂掉。

## 自动填充规则（重要）

`autoFill` 打开时，空窗格按「最值得看的」顺序补位，顺序是：

1. 当前会话（永远优先，保证底部输入框的目标看得见）
2. 正在运行的顶层会话
3. 有正在跑的后台 job 的会话
4. 有正在运行的子 agent 后代（`origin === 'subagent'` 且血缘连续）的会话
5. 正在运行的 **子 agent 会话本身**（它们也在会话列表里，所以可以单独占一个窗格）

补位结果记在内存里的 `runtime.auto`，**不会**因为某个会话跑完就把它换掉——窗格只在「该会话从列表里消失」
或用户点「重排」时才重排。点 📌 把某个窗格钉住 = 往 `paneIds[i]` 写死该会话 id，之后它不参与自动填充。
表头 select 换会话 = 同一个写入。`paneIds` 里未设的槽位交回自动填充。

## 数据通路（为什么能显示非当前会话）

壳子只给**当前会话**开历史窗口（`ClientSessions.followCurrent()` → `record.session.open()`），
所以窗格必须自己开：

```
ctx.get('sessions').binding(sessionId)     // 列表里的会话（含 subagent 行）都能拿到 binding
  → binding.session.open()                 // 冷会话自己拉第一页历史 + 建 live stream（幂等）
  → ctx.get('uiConversation').binding(binding).target('chat')
  → target.subscribe(notify)               // 订阅即 activate（激活是单调的，终身有效）
  → target.getSnapshot().legacy            // { nodes, partial, runningCalls } ← 渲染用的就这三样
```

- 同一个 hub 里按会话维护 feed，流事件合并 120ms 再通知 React（`notify` → `flush`）。
- 打开失败的会话最多重试 5 次，另有一个 2.5s 的慢 tick 兜底（会话晚到、传输抖动）。
- 会话从列表消失时对应 feed 立即释放。
- 子 agent 会话不在侧栏显示，但**在列表里**（所以能当窗格）；不在列表里的会话拿不到 binding。

## 界面接入的两个关键点

1. **`conversation.view` 列表槽位**：注册进去就自动出现在会话头部 tab 行（`viewTabs()` 读 entries），
   组件拿到 `sessionId / useSessions / useSessionPendingInteraction / t` 等标准 props。
2. **`data-conversation-composer-overlay` 属性**：根元素带上它，产品 CSS 的 `:has()` 规则会把
   `.scrollBody` 变成裁剪盒、`.viewArea` 变成 `flex:1 1 0; overflow:hidden`，View 才能自己拥有滚动
   （ui-trajectory 就是这么干的）。根元素 `height:100%` 于是正好等于中间列高度，外层不再滚动。
   底部留白用 `padding-bottom: calc(var(--dsh-composer-height,152px) + 14px)` 让开悬浮的输入框。

## 设置项

`columns`（1-4）、`autoFill`、`paneIds`（钉住的槽位）、`density`（comfy/compact）、`tail`（每窗格保留行数，8-200）、
`showReasoning`、`showJobs`、`follow`（自动跟随最新输出）。host 半只在 `ctx.inject(['settings'])` 里注册命名空间。

## 维护提示（2026-09-11 审查后补）

- **派生量按 list 快照缓存**：`childIndex` / `orderedIds` 都挂在 `WeakMap<listState, …>` 上。
  列表 store 只在列表变化时换快照对象，所以缓存天然失效；不缓存的话「每个窗格 × 每次流通知」
  都会重建子 agent 索引、并对 262 个会话重排（审查实测：一次 resolve 0.5ms → 0.03ms）。
- **一次会话只占一个窗格**：`assignSlot` 会把同一 session 从其它槽位清掉，避免"两个槽位钉同一个会话、
  第二个静默变成别的会话"。重复 id 在 `resolvePanes` 里也有兜底（`used` 去重）。
- **feed 生命周期**：`hub.setWanted(paneIds)` 在每次渲染后释放不在窗格里的 feed 订阅；
  View 卸载（切到 Chat 页）时释放全部。释放是无损的——会话自己的历史窗口由 `open()` 打开后一直有效，
  回来时只是重新订阅。
- **字典键要成对检查**：`text().pane.*` 读到的每个键都必须在 zh/en 两份字典里存在，
  否则 React 会静默丢掉 `title`/`aria-label`（审查时就是这样漏掉了 `pane.running` / `pane.idle`，
  状态点变成了"只有颜色"）。

## 已知边界

- **空白会话看不到**：产品在 `ConversationSession` 里对 `session.blank` 直接 `return null`，空白会话既不渲染
  View 也没有 tab 行，所以「新建会话」那一刻进不去并发窗格（打开任意一个有内容的会话即可）。
- **点击 ⤢ 会切到 Chat**：`sessions.open(id)` 会走产品自己的 per-session View 偏好恢复，目标会话没存过
  'panes' 偏好就回落到 Chat——所以这个按钮的语义就是「在 Chat 中打开」，不是「留在窗格里聚焦」。
- **停止按钮未做真实点击验收**（避免打断用户正在跑的两条管线）；它调的是 `ISession.cancel()`，业务失败会打
  `concurrent-panes: cancel rejected` 到 console。
- 窗格不做历史翻页：只显示 `open()` 拉到的第一页尾部（`tail` 行）。
- 一次最多 4 个窗格；每多一个窗格就多一条该会话的 live stream。

## 验收手法（复现）

Playwright（Python）驱动 `http://127.0.0.1:36900/?token=…`（token 见 `logs/dsh-web.log` 最后一行）：

1. 用 cookie 过 303 鉴权；`localhost` 首次访问会落到 hero（没有当前会话）。
2. JS 点开所有 `.ZxNXsa_chevron` 展开工作区 → 点 `.ZxNXsa_sessionRow`（按标题匹配）选中会话。
3. 点 `[role=tab]` 里文本为「并发 / Panes」的 tab。
4. 断言：`.dshcp-root` 存在、根元素高度 = 中间列高度、`.dshcp-pane` 数量 = columns、
   每个窗格 `.dshcp-row` 数量与末尾文本、`feed.scrollTop + clientHeight ≈ scrollHeight`（自动跟随）、
   console 零 error。
5. 想确认「真的在流」：临时在 hub 里加 `stats{notify,flush,listeners,feeds}` 并挂到 `window.__dshcp`，
   隔 8s 读两次计数——只看 DOM 容易被「这段时间该会话本来就没输出」骗到。
