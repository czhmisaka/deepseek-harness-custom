---
name: playwright_cli
description: Playwright CLI - 让 AI 控制浏览器进行前端调试和测试
---

# Playwright CLI

Playwright CLI 是一个命令行工具，让 AI 可以直接控制浏览器进行页面操作、测试和调试。

## 适用场景

- 前端开发调试：AI 改完代码后自己查看效果
- 表单测试：自动填写表单、点击按钮
- 页面巡检：检查页面是否正常加载
- 端到端测试：自动化测试用户流程

## 使用方式

1. 先用 `open` 打开浏览器访问页面
2. 用 `snapshot` 获取页面结构（获取元素引用编号）
3. 用元素编号进行点击、填表等操作
4. 用 `screenshot` 截图确认效果
5. 操作完成后用 `close` 关闭浏览器

## 常用命令

### 打开和导航
```bash
# 打开浏览器访问页面（无头模式）
playwright-cli open https://localhost:3000

# 打开浏览器并显示窗口（调试用）
playwright-cli open https://localhost:3000 --headed

# 导航到指定 URL
playwright-cli goto https://example.com

# 刷新页面
playwright-cli reload

# 前进/后退
playwright-cli go-back
playwright-cli go-forward
```

### 获取页面元素
```bash
# 获取页面快照，返回元素引用编号（如 e1, e2, e3）
playwright-cli snapshot

# 截图
playwright-cli screenshot
```

### 元素操作
```bash
# 点击元素（e21 是元素编号）
playwright-cli click e21

# 填写输入框
playwright-cli fill e15 "hello world"

# 输入文本（逐字符输入）
playwright-cli type "hello world"

# 悬停元素
playwright-cli hover e10

# 下拉选择
playwright-cli select e5 "option-value"

# 勾选/取消勾选复选框
playwright-cli check e3
playwright-cli uncheck e3

# 拖拽元素
playwright-cli drag e1 e2
```

### 键盘操作
```bash
# 按键
playwright-cli press "Enter"
playwright-cli press "ArrowDown"
playwright-cli press "Control+c"

# 键盘快捷键
playwright-cli keydown "Control"
playwright-cli keyup "Control"
```

### 鼠标操作
```bash
# 移动鼠标
playwright-cli mousemove 100 200

# 鼠标点击
playwright-cli mousedown
playwright-cli mouseup

# 滚动
playwright-cli mousewheel 0 300
```

### 标签页管理
```bash
# 列出所有标签页
playwright-cli tab-list

# 新建标签页
playwright-cli tab-new https://example.com

# 关闭标签页
playwright-cli tab-close 1

# 切换标签页
playwright-cli tab-select 0
```

### 网络操作
```bash
# 查看网络请求
playwright-cli network

# Mock 请求（拦截并返回自定义响应）
playwright-cli route "*/api/*"
```

### 控制台和调试
```bash
# 查看控制台日志
playwright-cli console

# 运行 JavaScript 代码
playwright-cli run-code "document.title"

# 启动追踪（录制操作轨迹）
playwright-cli tracing-start
playwright-cli tracing-stop
```

### 状态管理
```bash
# 保存登录状态
playwright-cli state-save session.json

# 恢复登录状态
playwright-cli state-load session.json
```

### 关闭
```bash
# 关闭当前浏览器会话
playwright-cli close

# 关闭所有浏览器会话
playwright-cli close-all

# 强制关闭所有僵尸进程
playwright-cli kill-all
```

## 元素编号说明

- 使用 `snapshot` 命令后，页面每个元素都会被分配一个编号（如 e1, e2, e3...）
- AI 通过这些编号来操作元素，不需要写 CSS 选择器
- 每次页面导航后，元素编号会重新分配，需要再次运行 `snapshot`

## 注意事项

1. 有头模式（--headed）可以看到浏览器窗口，适合调试
2. 无头模式（默认）浏览器在后台运行，token 消耗更低
3. 页面快照和截图保存到文件，不塞进 AI 上下文，节省 token
4. 同一个任务比 MCP 省约 4 倍 token