# 动态插件

DSH 的插件除了 `packages/` 源码树里的正式插件外，还有一类「动态插件」——不进源码树、以运行时方式挂载。本目录收录其全部配置与源码，共两种持久化形态。

## 形态一：profile patch 固化插件（`web-profile/`）

由会话级动态插件「固化」而来：源码放进 `~/.dsh/profiles/web/plugins/<name>/`，并在 `~/.dsh/profiles/web/cordis.patch.yml` 的 `insert` 列表登记一行。随 profile 启动自动挂载，**重启持久**，无需 cordis_define。

| 插件 | patch id | 功能 |
| --- | --- | --- |
| [computer-use](web-profile/plugins/computer-use/) | `tool-computer-use` | macOS 截图/鼠标/键盘控制（需辅助功能 + 屏幕录制权限，拖拽/点击需 `brew install cliclick`） |
| [mac-perf](web-profile/plugins/mac-perf/) | `mac-perf` | Mac 性能看板：CPU/内存/磁盘/网络/电池/进程实时指标，host 半挂 `/mac-perf/snapshot` 路由供 client 同源轮询 |
| [turn-rail](web-profile/plugins/turn-rail/) | `turn-rail` | 对话右侧轮次导航时间轴重样式：贯穿脊线/刻度层次/轮次序号/升级预览卡，关闭·精简·标准·强调四档，设置持久化 |
| [concurrent-panes](web-profile/plugins/concurrent-panes/) | `concurrent-panes` | 并发窗格：对话区新增「并发」View，1~4 个会话并排铺开、各自实时流式输出，布局持久化 |
| [usage-glass](web-profile/plugins/usage-glass/) | —（当前未挂载） | 早期打包版「用量台账 + 拖拽气泡 + 液态玻璃主题」；后升级为正式插件包（见 overlay 的 `packages/llm/usage-ledger`、`packages/client/ui-usage`、`packages/client/ui-theme-liquid-glass`），保留备查 |

### 安装

1. 把需要的插件目录拷到 `~/.dsh/profiles/web/plugins/`：
   ```sh
   cp -R web-profile/plugins/<name> ~/.dsh/profiles/web/plugins/
   ```
2. 把 `web-profile/cordis.patch.yml` 里的 `insert` 条目**合并**进你自己的 `~/.dsh/profiles/web/cordis.patch.yml`（⚠️ 直接整文件覆盖会丢掉你已有的 patch 条目）
3. 重启 DSH Web profile 生效

`headless` profile 当前 patch 为空（`[]`），无固化插件。

### 开发源码（`dev-sources/`）

profile 里的插件是**构建产物**（esbuild 打包后的 index.js / lib/client.js）。对应的可构建开发源码：

- [dsh-plugin-computer-use](dev-sources/dsh-plugin-computer-use/) —— computer-use 的完整开发仓库：`src/`（client 未打包源码）、`tests/`（2 个 node:test 文件，34 个用例：按键解析/坐标换算/权限求交/后端路由等）、`build.sh`（esbuild 出 CJS + `__ModuleLoader__.load` wrapper，含 client 产物格式强制说明）、`install.sh`

## 形态二：纯会话级动态插件（`task-progress-hud/`）

通过 `cordis_define` + `cordis_run` 在会话中定义/激活，**进程重启即消失**，本目录即其源码存档与再部署说明：

- [task-progress-hud](task-progress-hud/) —— DSH Web 右下角浮动任务进度面板（任务清单/workflow/子代理/后台作业/目标轮次/超 4 秒工具调用），配套 skill 在 [`skills/task-progress-hud/`](../skills/task-progress-hud/)
