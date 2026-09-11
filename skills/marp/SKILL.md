---
name: marp
description: 使用 Marp (Markdown Presentation) 通过编写 Markdown 生成 PPT 幻灯片。当需要用 Markdown 快速创建演示文稿、导出 PDF/PPTX/HTML 时使用，适合技术文档和代码演示。
---

# Marp

用 Markdown 写 PPT，导出为 PDF、PPTX、HTML。

## 安装

```bash
npm install -g @marp-team/marp-cli
```

## 快速开始

创建 `slide.md`:

```markdown
---
marp: true
theme: default
paginate: true
---

# 第一页标题

---

## 第二页

- 列表项 1
- 列表项 2
```

转换为 PPTX：

```bash
marp slide.md -o presentation.pptx
```

## 常用选项

| 输出格式 | 命令 |
|---------|------|
| PDF | `marp slide.md -o slide.pdf` |
| PPTX | `marp slide.md -o slide.pptx` |
| HTML | `marp slide.md -o slide.html` |
| PPTX (多文件) | `marp slide.md -o output/` |

## 主题

```yaml
---
marp: true
theme: default      # default, gaia, uncover
---
```

内置主题：default, gaia, uncover

## 页面控制

```yaml
---
marp: true
paginate: true      # 页码
backgroundColor: #1a1a1a
---
```

## 语法

### 标题
```markdown
# H1 (新幻灯片)
## H2
### H3
```

### 列表
```markdown
- Item 1
  - Subitem
- Item 2
```

### 代码块
<pre><code>```python
print("hello")
```</code></pre>

### 图片
```markdown
![width:500px](image.jpg)
```

### 表格
```markdown
| A | B | C |
|---|---|---|
| 1 | 2 | 3 |
```

### 分页
`---` 表示新幻灯片

## 自定义主题

创建 `custom-theme.css`:

```css
@import 'gaia';

section {
  background-color: #fff;
  color: #333;
}

h1 {
  color: #0066cc;
}
```

使用自定义主题：
```bash
marp --theme custom-theme.css slide.md -o out.pptx
```

## 输出选项

```bash
# 指定输出目录
marp slide.md -o ./output/

# 渲染为 HTML (单文件)
marp slide.md --html -o out.html

# PDF 需要额外工具，或用 --pdf
marp slide.md --pdf -o out.pdf
```
