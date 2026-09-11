---
name: planka
description: Planka 看板任务管理工具。当用户提到看板、任务管理、周报生成、周看板相关需求时使用。支持查看任务列表、创建任务、移动任务状态、创建周看板、生成周报。
---

# Planka 看板任务管理

## 快速开始

```bash
# 配置 API Key（⚠️ 配置文件在 scripts/ 目录下，不是 skill 根目录！）
cd ~/.agents/skills/planka
cp scripts/config.example.json scripts/config.json
# 编辑 scripts/config.json 填入 API Key 和 board_id

# 查看当前看板摘要
python3 scripts/planka.py summary

# 查看所有命令
python3 scripts/planka.py help
```

## 主要功能

### 任务操作
- `tool.get_summary()` - 获取当前看板任务摘要
- `tool.get_lists()` - 获取看板所有列表
- `tool.create_card(list_id, name)` - 创建任务
- `tool.move_card(card_id, target_list_id)` - 移动任务（仅创建者可操作）
- `tool.update_card(card_id, name)` - 更新任务名称
- `tool.delete_card(card_id)` - 删除任务（仅创建者可操作）

### 看板操作
- `tool.get_boards()` - 获取项目下所有看板
- `tool.switch_board(board_name)` - 切换当前看板
- `tool.create_weekly_board()` - 创建新周看板（自动包含四个默认列表）

### 搜索与周报
- `tool.find_card_in_all_boards(keyword)` - 全局搜索任务
- `tool.generate_weekly_report()` - 生成周报

## 默认配置
- API 地址: `https://planka.zj.cool`
- 默认项目: `每周任务总览`
- 默认列表: 📋 昨日完成、📌 今日计划、🤝 需要协调、✅ 本周完成

## 权限规则
| 操作 | 权限 |
|------|------|
| 查看/搜索 | ✅ 所有有权限的看板 |
| 创建任务 | ✅ 当前看板成员 |
| 修改/移动/删除 | ✅ **仅创建者** |

## 常见问题

**Q: 如何获取 API Key？**
A: 在 Planka 页面右上角用户菜单 -> API Keys -> 创建新的 Key。

**Q: 为什么移动任务失败？**
A: 只有任务创建者才能移动任务。可以用 `tool.is_card_creator(card_id)` 检查权限。

**Q: 如何查看所有看板？**
A: `python3 scripts/planka.py boards`
