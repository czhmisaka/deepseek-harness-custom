# dsh-tool-computer-use

给 DeepSeek Harness (dsh) 增加 **computer use** 能力的插件：模型可以截屏，并在真实机器上移动鼠标、点击、拖拽、打字、按键。macOS 专用。

- 工具名：`computer`，单一工具、动作判别式（Anthropic computer-use 风格）
- 零 npm 依赖：只调用 macOS 自带的 `screencapture` / `osascript`，可选增强用 `cliclick`
- 坐标体系：模型永远用**最新一张截图附件的像素坐标**，插件按该次截屏的映射自动换算成屏幕点（points），模型不做缩放心算

## 动作表

| action | 参数 | 后端 | 说明 |
|---|---|---|---|
| `screenshot` | — | screencapture | 主显示器截屏（含鼠标指针），图片走附件存储回传给模型；PNG 超 字节上限自动降级 JPEG |
| `cursor_position` | — | JXA/CoreGraphics | 返回光标位置（屏幕点 + 截图像素两套坐标） |
| `left_click` | `coordinate` | cliclick 或 System Events | 左键单击 |
| `double_click` | `coordinate` | 仅 cliclick | 双击 |
| `right_click` | `coordinate` | 仅 cliclick | 右键单击 |
| `move` | `coordinate` | 仅 cliclick | 移动指针（不点击） |
| `drag` | `start_coordinate` + `coordinate` | 仅 cliclick | 按下-拖动-释放 |
| `type` | `text` | System Events | 向焦点应用输入文本；换行→Return，制表→Tab |
| `key` | `key` | System Events | 单键或组合键，如 `Return`、`cmd+c`、`ctrl+shift+T`；命名键：Return/Tab/Escape/Delete/ForwardDelete/Space/Up/Down/Left/Right/PageUp/PageDown/Home/End/F1-F12 |
| `scroll` | `direction`, `amount`(默认3,上限40) | System Events | 键盘式滚动（方向键连按，粗粒度） |
| `wait` | `durationMs` (1–60000) | — | 等待，可被取消 |

`coordinate` 一律为整数 `[x, y]`，以**最新一张截图的附件图像**为基准（工具结果文本里也写明了这条约定）。指哪打哪之前必须先 `screenshot`——没有截图时点击类动作会直接报错，逼着智能体"先看后动"。

## 安装（装进运行中的 profile）

在仓库 checkout 目录执行：

```sh
# 1. 把插件装进 web profile（file: 方式复制进 profile 依赖）
pnpm dsh plugin --profile web add <本插件源码目录>

# 2. 编辑 ~/.dsh/profiles/web/cordis.patch.yml，插入插件行：
```

```yaml
- insert:
    - id: tool-computer-use
      name: 'dsh-tool-computer-use'
      config:
        allowedActions: [screenshot, cursor_position, left_click, double_click, right_click, move, drag, type, key, scroll, wait]
```

- `allowedActions` **必填**：这是有意的安全设计——挂载即明确授权，且可以收窄（比如去掉 `type` 禁止打字）。
- web profile 是 `patchReload: live`，保存 patch 文件后自动重组合，无需重启。
- 更新插件代码后重新执行第 1 步（file: 是复制安装），再随便动一下 patch 文件触发重组合。

## 设置弹窗（web 设置页 → Computer 使用）

设置页的 "Computer 使用" 区块就是本插件的运行时控制面板，所有配置持久化在 settings.yaml 的 `computer-use` 命名空间：

| 控件 | 说明 |
|---|---|
| 总开关 | 关闭后所有 `computer` 动作立即被拒绝（工具报错并指引回设置页） |
| 运行环境 | 实时探测并展示：屏幕录制 / 辅助功能 TCC 授权状态、cliclick 是否可用、发现的显示器数量；未授权项附修复指引 |
| 动作权限分配 | 逐动作开关（观察 / 鼠标 / 键盘 / 其他分组），并带 **只读观察**、**完全控制** 两个预设。部署 `allowedActions` 是上限——部署未授权的动作在这里锁定为"部署未授权"；用户层只能在上限内继续收窄 |
| 可用屏幕 | 选择模型可截取和控制的显示器（默认主显示器）。选定后截屏只拍该屏、坐标只在该屏映射换算，其他屏幕既看不见也点不到；键盘输入仍作用于系统聚焦的应用 |

权限是两层模型：**部署层**（cordis.patch.yml 的 `allowedActions`，决定" ever 可用"）∩ **用户层**（设置页逐动作开关，只可收窄）。两层任一拒绝即拒绝，且报错区分两种来源、给出对应入口。

实现说明：设置页需要的非持久数据（部署 allowlist、显示器列表、环境探测结果）由宿主在注册命名空间时以 schemastery 自定义 meta（`computerUi`）随 settings.describe 下发，显示器列表与探测结果在插件 apply 后异步填充并就地更新 schema meta——下一次 describe 读取即携带最新数据，无需任何私有 RPC。

## 权限（重要）

macOS 的 TCC 权限授予**启动 dsh 的那个 App**（通常是终端，如 Terminal/iTerm2；本机是 nohup 脚本启动，责任 App 即启动它的终端）：

| 权限 | 用途 | 缺失时的表现 |
|---|---|---|
| 屏幕录制 (Screen Recording) | `screencapture` | 截屏报 "could not create image from display"，工具会提示去 授予 |
| 辅助功能 (Accessibility) | System Events 键鼠控制 | osascript 报 -25211/-10004/权限违例，工具会提示去授予 |

路径：系统设置 → 隐私与安全性 → 屏幕录制 / 辅助功能，添加并勾选启动 dsh 的 App，然后**重启 dsh**。可用下面命令自检（返回 true = 已授权）：

```sh
osascript -e 'tell application "System Events" to get UI elements enabled'
```

可选增强（双击/右键/移动/拖拽需要）：

```sh
brew install cliclick
```

## 安全须知

- 每个动作都**立即在真实机器上执行**，没有演练模式。模型能点到的、能输入的地方都会真发生。
- 插件不内置逐动作审批；管控有三层可用：部署层 `allowedActions`（收窄动作面，例如只留 `screenshot` + `cursor_position` 做只读观察）、设置页的逐动作开关（用户层收窄）、以及"可用屏幕"限定（把模型限制在一块屏上）。
- 截屏文件落在 `$TMPDIR/dsh-computer-use-*.png|jpg`（权限 0600），定期可清理；图片本体另存于 harness 附件存储。环境探测用的 1×1 试截同样落在临时目录并立即删除。

## 设计说明

- **挂载门控**：工具在 `ctx.inject(['attachments'], …)` 内注册——没有持久附件存储的部署根本没有这个工具（截屏必须能进上下文才有意义）；execute 内保留防御性复查。
- **图像路由门控**：`screenshot` 前校验当前模型路由声明了 image 输入（与 `read_image` 同一规则）：看不见截图的模型拒绝截屏，而不是返回永远无法检查的像素。
- **串行执行**：`isConcurrencySafe: () => false`——键鼠操作顺序敏感，截图映射也必须和模型看到的最新画面一致。
- **错误翻译**：TCC 拒绝（英文/中文系统签名都匹配）翻译成带操作指引的报错；cliclick 缺失时报 `brew install cliclick`。
- **取屏幕尺寸/光标位置走 JXA + CoreGraphics**：这两样不需要任何 TCC 权限，永远可用。

## 多显示器

- 显示器枚举走 JXA + NSScreen（无需 TCC 权限），帧坐标从 Cocoa 的左下原点换算为全局左上原点空间，已与 `CGDisplayBounds` 交叉验证一致。
- 非主屏截屏用 `screencapture -R x,y,w,h` 区域截取——按全局坐标精确定位到所选显示器，不依赖 screencapture 的显示器排序。
- 坐标映射携带显示器全局原点：截图像素 → 该屏内点 → 加原点得全局点；cliclick 与 System Events 都接受全局坐标，副屏点击无需换算。
- 光标位置转换：光标在所选屏上时返回截图像素坐标；在别的屏上时诚实省略像素坐标（只给全局点），不再给出钳制到边缘的误导值。
- 设置值存的是 1-based 显示器序号（`'main'` 或 `'2'`），不存 CGDirectDisplayID（id 与序号可能撞值且有歧义）。所选显示器被拔掉时截屏报错并列出当前可用屏幕。

## 已知限制

- 一次只能指定一个可用屏幕；想让模型跨多屏工作需要先在设置里切换目标屏。
- 设置页的显示器列表来自插件 apply 时的探测：已打开的设置页不会自动感知显示器热插拔（刷新页面、重启 dsh 或任意一次设置写入后会更新）。
- `scroll` 是键盘模拟（方向键），不是滚轮事件，粗粒度；部分应用横向滚动无效果。
- 无 cliclick 时右键/双击/移动/拖拽不可用（报错并提示安装）。
- 暂不支持逐动作用户审批（可后续接 dsh 的 interaction/approval seam）。
- Windows/Linux 不支持（apply 阶段即报错）。

## 测试

```sh
node --test 'tests/*.test.mjs'
```

34 个用例覆盖：按键解析与 AppleScript 脚本构建（含转义/换行/制表）、坐标换算与越界钳制（含显示器原点偏移与 pointToImage）、动作白名单校验、显示器设置解析（main/序号/缺失报错）、双层权限求交、后端路由（cliclick 检测/缓存/回退/参数拼接）、多显示器枚举解析、区域截屏参数、环境探测（TCC/权限/cliclick）、TCC 错误翻译。
