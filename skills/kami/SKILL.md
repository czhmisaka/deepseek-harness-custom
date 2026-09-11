---
name: kami
description: >
  专业文档排版设计系统 — 羊皮纸画布 + 墨蓝单一强调色 + 衬线字体层级 + 紧凑编辑节奏。
  适用类型：简历、一页纸、白皮书/长文、正式信函、简历、作品集、幻灯片。
  触发词：做 PDF / 排版 / 生成报告 / 一页纸 / 白皮书 / 作品集 / 正式信件 / 简历 / PPT / slides /
  高质量文档 / 好看的排版 / make a resume / make a one-pager / design a slide deck /
  turn this into a PDF / make this presentable / polish typography。
  输出语言匹配：中文 → TsangerJinKai02 + Source Han，英文 → Newsreader + Inter。
  核心哲学：warm parchment (#f5f4ed) + ink-blue (#1B365D) 单一强调色 + serif-led hierarchy。
---

# kami · 紙（OpenClaw 版）

> 本 skill 基于 https://github.com/tw93/kami
> 本地路径：~/Desktop/螃蟹的家/skills/kami/
> 核心资产：templates/ | assets/diagrams/ | scripts/

## 定位

**紙 · かみ** — the paper your deliverables land on.

Good content deserves good paper. 一个设计系统覆盖六种文档类型：warm parchment canvas、ink-blue accent、serif-led hierarchy、tight editorial rhythm.

**与花叔 Design 的分工**：
- 花叔 Design → 动画、交互原型、幻灯片（偏动态/视觉）
- kami → 静态文档排版（偏印刷/文字质感）

## 设计哲学（8条核心）

1. 画布背景是羊皮纸 **#f5f4ed**，不是纯白
2. **强调色是墨蓝 #1B365D**，且不超过页面 5%；超过就是视觉噪音
3. 所有灰度偏暖黄褐（无冷灰）
4. 英文衬线体做标题+正文；中文衬线标题+无衬线正文
5. 正文字重 400，标题字重 500；避免人工加粗
6. 三档行高：标题 1.1-1.3 / 紧凑 1.4-1.45 / 阅读 1.5-1.55
7. 标签背景必须是纯 hex；不用 rgba（WeasyPrint 双矩形 bug）
8. 只用 ring 或 whisper 阴影，不用硬阴影

## 适用文档类型

| 用户说 | 文档类型 | 中文模板 | 英文模板 |
|--------|---------|---------|---------|
| "one-pager / 方案 / 执行摘要 / exec summary" | One-Pager | `one-pager.html` | `one-pager-en.html` |
| "white paper / 白皮书 / 长文 / 年度总结 / technical report" | Long Doc | `long-doc.html` | `long-doc-en.html` |
| "formal letter / 信件 / 辞职信 / 推荐信 / memo" | Letter | `letter.html` | `letter-en.html` |
| "portfolio / 作品集 / case studies" | Portfolio | `portfolio.html` | `portfolio-en.html` |
| "resume / CV / 简历" | Resume | `resume.html` | `resume-en.html` |
| "slides / PPT / deck / 演示" | Slides | `slides.py` | `slides-en.py` |

## 工作流程

### Step 1 · 语言判断

**匹配用户语言**：
- 用户写中文 → 中文模板（TsangerJinKai02 + Source Han）
- 用户写英文 → 英文模板（Newsreader + Inter）
- 用户写日文 → CJK 模板路径（Mincho 回退）

### Step 2 · 文档类型

按上表选择正确的模板。

### Step 2.1 · 素材检查（涉及具体品牌时）

| 素材类型 | 必需条件 | 可接受来源 |
|---------|---------|---------|
| Logo | 任何品牌文档 | 用户文件或官方 SVG/PNG |
| 产品图 | 实体产品/场地/实物 | 官方图片、用户提供、标注缺失 |
| UI 截图 | App/SaaS/网站/工具 | 当前截图、官方产品图 |
| 品牌色 | 品牌一页纸/作品集/幻灯片 | 官方值、提取值、或保持 kami ink-blue |
| 字体 | 仅当品牌字体有辨识度时 | 官方字体、接近系统回退 |

### Step 2.5 · 内容提炼（raw content 时）

当用户给的是**原始素材**（会议记录、脑暴、散乱观点）：

1. **Extract**：提炼每个事实主张、数字、日期、来源
2. **Classify**：按目标模板的章节结构组织
3. **Gap-check**：列出模板需要但内容缺少的
4. **问一次**：把 gap 表发给用户，不要自行填补

### Step 3 · 按需求选择规范层级

| 层级 | 何时用 | 读什么 |
|------|--------|--------|
| **Content-only** | 仅更新文本、翻译现有文档 | `CHEATSHEET.md` |
| **Layout tweak** | 调整间距、移区块、改字号 | `CHEATSHEET.md` + 模板 |
| **New document** | 从零构建 | 完整设计规范 + 写作规范 + 模板 |
| **Deck (>20 slides)** | 长演示 | 完整规范 + Deck Recipe |
| **Diagram** | 在文档中嵌入 SVG | `assets/diagrams/` |

### Step 4 · 内容填充到模板

- 复制模板到工作目录，不要从零写 HTML
- **CSS 保持不动**，只编辑 body 内容
- 内容遵循：数据优于形容词，独特措辞优于行业陈词

**PDF 元数据**（WeasyPrint 读取这些填充到 PDF）：

| 占位符（中文）| 占位符（英文）| 规则 |
|--------------|--------------|------|
| `{{作者}}` | `{{AUTHOR}}` | 简历/信件/作品集：用文档中的人名；其他留空（build 脚本自动推断）|
| `{{摘要}}` | `{{DESCRIPTION}}` | 从前两段提炼一句（≤150字符）|
| `{{关键词}}` | `{{KEYWORDS}}` | 标题+章节标题中提取 3-5 个关键词 |
| `{{文档标题}}` | `{{DOC_TITLE}}` | 从 H1 或标题文本推断 |

### Step 5 · 构建与验证

```bash
# 构建 + 验证所有模板
python3 scripts/build.py --verify

# 验证单个文档
python3 scripts/build.py --verify resume-en

# 检查占位符
python3 scripts/build.py --check-placeholders path/to/filled.html

# CSS 规则检查（快速）
python3 scripts/build.py --check
```

## 字体说明

**中文**
- 主衬线：TsangerJinKai02-W04.ttf（400）+ W05（500）
- 回退链：Source Han Serif SC → Noto Serif CJK SC → Songti SC → Georgia

**英文**
- 主衬线：Newsreader（Google Fonts，开源）——用于标题和正文
- 无衬线：Inter——仅用于 UI 元素（标签、eyebrow、元数据）

**字体自动恢复（本地构建）**：

```bash
# 构建前检查字体文件
test -f assets/fonts/TsangerJinKai02-W04.ttf || {
  curl -fsSL "https://cdn.jsdelivr.net/gh/tw93/Kami@main/assets/fonts/TsangerJinKai02-W04.ttf" \
    -o assets/fonts/TsangerJinKai02-W04.ttf
  curl -fsSL "https://cdn.jsdelivr.net/gh/tw93/Kami@main/assets/fonts/TsangerJinKai02-W05.ttf" \
    -o assets/fonts/TsangerJinKai02-W05.ttf
}
```

## 图表原语（嵌入文档用，非独立第七类文档）

| 用户说 | 图表类型 | 模板 |
|--------|---------|------|
| "架构图 / architecture / 系统图" | 架构 | `assets/diagrams/architecture.html` |
| "流程图 / flowchart / 决策流" | 流程 | `assets/diagrams/flowchart.html` |
| "象限图 / quadrant / 优先级矩阵" | 象限 | `assets/diagrams/quadrant.html` |
| "柱状图 / bar chart" | 柱状 | `assets/diagrams/bar-chart.html` |
| "折线图 / line chart / 趋势" | 折线 | `assets/diagrams/line-chart.html` |
| "环形图 / donut / pie / 占比" | 环形 | `assets/diagrams/donut-chart.html` |
| "状态机 / state machine" | 状态机 | `assets/diagrams/state-machine.html` |
| "时间线 / timeline / 里程碑" | 时间线 | `assets/diagrams/timeline.html` |
| "泳道图 / swimlane / 跨角色流程" | 泳道 | `assets/diagrams/swimlane.html` |
| "树状图 / tree / 层级" | 树状 | `assets/diagrams/tree.html` |

**画之前先问**：一段写得好的段落是否比图表教给读者的更少？如果是，不要画。

## 反馈处理

用户给出**模糊视觉反馈**（"看着不对劲"、"间距奇怪"、"不够优雅"）：

**不要猜**。用 kami 词汇反问，包含当前值。

| 用户说 | 问什么 |
|--------|--------|
| "太挤了" / "too cramped" | 哪个元素？行高（当前 X）？内边距（当前 Y）？页边距？ |
| "颜色不对" / "color feels wrong" | 哪个元素？品牌蓝用过头？灰色读起来太冷？ |
| "不够好看" / "not polished" | 字体渲染？对齐？留白分布？层级不清？ |
| "看着不专业" / "unprofessional" | 内容措辞？还是版式（对齐、一致性）？|

模板回复："X 当前设为 Y。你想要 (a) [规范内的具体替代] 或 (b) [另一个选项]？"

## 不适用场景

- 用户明确要求 Material / Fluent / Tailwind 默认风格——不同的设计语言
- 需要 dark / cyberpunk / futurist 美学——这是刻意反未来的设计
- 需要饱和多色——这里只有一个强调色
- 需要卡通/动画/插画风格——这是编辑排版，不是

## 快速触发检查

当用户说以下词时，激活本 skill：
- 做 PDF / 排版 / 生成报告 / 一页纸 / 白皮书 / 作品集
- 正式信件 / 简历 / PPT / slides / 高质量文档 / 好看的排版
- make a resume / make a one-pager / design a slide deck
- turn this into a PDF / make this presentable / polish typography
- 当用户提供原始内容要被"排版/设计/呈现"时
