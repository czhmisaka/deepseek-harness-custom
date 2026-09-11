---
name: python-pptx
description: 使用 python-pptx 库生成和编辑 PowerPoint 演示文稿。当需要创建、编辑 .pptx 文件时使用，包括：自动化报告生成、批量创建幻灯片、数据驱动的图表展示、模板填充等场景。
---

# python-pptx

用 python-pptx 创建、读取、编辑 PPT 文件。

## 安装

```bash
pip install python-pptx
```

## 核心概念

| 概念 | 说明 |
|------|------|
| Presentation | 整个演示文稿 |
| Slide | 幻灯片 |
| Shape | 形状/文本框 |
| TextFrame | 文本框容器 |
| Paragraph | 段落 |
| Run | 文字块(同样式连续文本) |

## 幻灯片布局

| 索引 | 布局 |
|------|------|
| 0 | 标题幻灯片 |
| 1 | 标题和内容 |
| 5 | 空白 |
| 其他 | 节标题/两栏/比较/图片与标题等 |

## 基础操作

### 创建保存
```python
from pptx import Presentation
prs = Presentation()
prs.save('demo.pptx')
```

### 添加幻灯片
```python
slide = prs.slides.add_slide(prs.slide_layouts[0])  # 标题页
title = slide.shapes.title
subtitle = slide.placeholders[1]
title.text = "标题"
subtitle.text = "副标题"
```

### 文本框
```python
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

text_box = slide.shapes.add_textbox(Inches(1), Inches(1), Inches(4), Inches(2))
tf = text_box.text_frame
tf.text = "第一段"
p = tf.add_paragraph()
p.text = "第二段"
p.level = 1  # 缩进
p.font.size = Pt(18)
p.font.name = '宋体'
p.font.color.rgb = RGBColor(255, 0, 0)
```

### 图片
```python
slide.shapes.add_picture('image.png', Inches(1), Inches(1), width=Inches(4))
```

### 形状
```python
from pptx.enum.shapes import MSO_SHAPE
shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1), Inches(1), Inches(3), Inches(2))
shape.fill.solid()
shape.fill.fore_color.rgb = RGBColor(0, 128, 255)
```

## 高级功能

### 表格
```python
table = slide.shapes.add_table(3, 4, Inches(1), Inches(1), Inches(6), Inches(2)).table
table.cell(0, 0).text = "标题"
table.cell(0, 0).merge(table.cell(0, 1))  # 合并
```

### 图表
```python
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE

chart_data = CategoryChartData()
chart_data.categories = ['Q1', 'Q2', 'Q3', 'Q4']
chart_data.add_series('销售额', (120, 180, 150, 220))

chart = slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    Inches(1), Inches(1), Inches(6), Inches(4.5),
    chart_data
).chart
chart.has_title = True
chart.chart_title.text_frame.text = "季度销售"
```

### 读取现有PPT
```python
prs = Presentation('existing.pptx')
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame:
            print(shape.text)
        if shape.has_table:
            for row in shape.table.rows:
                for cell in row.cells:
                    print(cell.text)
```

## 常用代码片段

### 批量生成报告
```python
def create_report(data_list, output_file):
    prs = Presentation()
    title_slide = prs.slides.add_slide(prs.slide_layouts[0])
    title_slide.shapes.title.text = "年度数据报告"
    
    for data in data_list:
        slide = prs.slides.add_slide(prs.slide_layouts[1])
        slide.shapes.title.text = data['title']
        slide.placeholders[1].text_frame.text = data['content']
    
    prs.save(output_file)
```

### 样式设置函数
```python
def set_text_style(text_frame, font_size=18, font_name='Arial', color=None):
    for paragraph in text_frame.paragraphs:
        paragraph.font.size = Pt(font_size)
        paragraph.font.name = font_name
        if color:
            paragraph.font.color.rgb = color
        for run in paragraph.runs:
            run.font.size = Pt(font_size)
            run.font.name = font_name
            if color:
                run.font.color.rgb = color
```

## 限制

- ❌ 旧版 .ppt / 动画 / 幻灯片切换 / 视频/音频 / 宏 / SmartArt
- ⚠️ 复杂图表仅部分支持

## 故障排除

### Python 3.11 兼容性问题

如果遇到 `AttributeError: module 'collections' has no attribute 'Container'`，是因为 python-pptx 1.0.2 不兼容 Python 3.11。

**解决方案**：安装到本地目录，使用 PYTHONPATH

```bash
# 安装到本地目录
pip install python-pptx --target=~/Desktop/螃蟹的家/pptx_lib

# 使用时指定 PYTHONPATH
PYTHONPATH=~/Desktop/螃蟹的家/pptx_lib python3 your_script.py
```

## 输出

```python
prs.save('output.pptx')
```

**官网**: https://python-pptx.readthedocs.io/
