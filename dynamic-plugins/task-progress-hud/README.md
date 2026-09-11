# task-progress-hud（动态插件 `prog-1`）

DSH Web 右下角自动浮现的浮动任务进度面板：无任务时完全隐藏，出现可量化任务时自动浮现、实时推进、完成变绿 6 秒后淡出。使用说明见配套 skill [`skills/task-progress-hud/`](../../skills/task-progress-hud/)，本目录是它的完整源码（host 半 + client 半）与再部署说明。

## 跟踪什么

- `task_progress` 工具手动上报的量化任务（start / update / finish / fail）
- 自动跟踪：todo 清单、workflow、subagent、后台作业、goal 轮次、超过 4 秒的工具调用（转圈行）

## 部署

1. `cordis_define`：`plugin.kind = 'new'`、`idPrefix: 'prog'`；`code.host` ← [host.js](host.js) 全文，`code.client` ← [client.js](client.js) 全文（均为纯 JavaScript，无需转换）
2. `cordis_run`（mode: `run`）；若返回 awaiting-approval，在会话卡片点 ✓ 授权（client 半需要用户授权）
3. 修复/更新走「同 Plugin 追加新 Package」（`kind: 'existing'`），不要新建同名插件

## 两个 schema 铁律（defineTool 会当场抛错）

- `output.schema` 的对象**必须显式** `additionalProperties: true`（省略报 "must be explicitly true or false"）
- `parameters` 根对象**不能写** `additionalProperties: false`（报 "must be true or omitted…"），省略或 true

## 可调参数（源码顶部常量）

| 常量 | 位置 | 默认 | 含义 |
| --- | --- | --- | --- |
| `LONG_TOOL_MS` | host | 4000 | 工具调用超过多少毫秒显示转圈行 |
| `TERMINAL_VISIBLE_MS` | client | 6000 | 完成后停留时长 |
| `TERMINAL_TTL_MS` | host | 120000 | 终态任务清理 TTL |
| `POLL_MS` | client | 700 | 快照轮询间隔 |
| HUD 位置 | client CSS | `.ph-hud { right:16px; bottom:148px; width:330px }` | 面板位置与宽度 |

## 依赖

- host：`timer` 服务（inject）、`harness.defineTool` / `harness.handle`、`jobs` 服务（可选，`ctx.get` 探测）
- client：`timer`、`slots`、`styles` 服务；挂载点 `shell.overlay` 与 `tool.view.cordis`
