# deepseek-harness-custom

个人定制的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) **差异打包**：不复制上游完整源码，只收录「在上游基线之上新增/修改的部分」——本地插件与功能改动（overlay）、用户级 skills、以及一个 agent preset。

上游本身是 MIT 协议的公开仓库，本仓库只承载个人差异层，便于回顾与迁移。

## 基线

| 项目 | 值 |
| --- | --- |
| 差异基线（merge-base） | `4e84901e6471b79ec0338099867ebb4606d12bb5`（上游 `dsh-0.1.2-alpha.4` 合并点） |
| 本地 HEAD | `60a731d53b`（36 个本地提交）+ 工作区未提交改动 |
| 差异文件总数 | 111 个（无删除、无二进制） |

完整提交清单与差异文件清单见 [MANIFEST.md](MANIFEST.md)。

## 自研功能（overlay 核心）

### usage ledger —— 跨会话 token 用量台账

- `packages/llm/usage-ledger/`：持久的跨会话 token 用量记录（含 `/usage` 命令）
- `packages/client/ui-usage/`：shell 浮层用量气泡（可拖拽、记忆位置）+ Web 用量仪表盘（会话明细表、24 小时趋势图、模型占比、B/T 级数值缩放）

### ui-theme-liquid-glass —— 液态玻璃海洋主题

- 磨砂玻璃表面 + backdrop blur 的整体视觉
- 数字海壁纸：屏幕锚定的多层窗口海洋、吉卜力风格波浪（风格/视角可调）、0.75x 分辨率渲染、像素海洋风格
- 独立设置页，实时参数调节，持久化设置文档

### 其他

- `packages/llm/llm*`、`packages/web/web-search-deepseek/`、`packages/sdk/`、`packages/subagent/`、`python/sdk/`、`packages/bundle/*` 等配套改动与文档、快照、构建配置更新

## 目录结构

```
overlay/                  # 对 deepseek-harness 仓库的差异文件（保持上游相对路径）
skills/                   # 用户级 skills（15 个，来自 ~/.agents/skills）
presets/glm-agent/        # GLM 工具 agent preset（PTC 模式，glm-5.3-flash）
dynamic-plugins/          # 动态插件：profile 固化插件 + 会话级插件源码与部署说明
scripts/deploy.sh         # 一键部署到新 DSH（见 DEPLOY.md）
scripts/apply-overlay.sh  # 把 overlay 应用到一个 deepseek-harness 检出
scripts/install-skills.sh # 把 skills 安装到 ~/.agents/skills/
```

## 快速部署到新 DSH

```sh
git clone https://github.com/czhmisaka/deepseek-harness-custom
cd deepseek-harness-custom

# 发布版路径（npx 装的 dsh，最快）：
bash scripts/deploy.sh --yes

# 源码路径（功能全量，含 overlay）：
bash scripts/deploy.sh --harness /path/to/deepseek-harness --yes
```

两条路径的差异、基线漂移处理与部署后注意事项见 [DEPLOY.md](DEPLOY.md)。

## 如何应用

### 1. 应用 overlay

```sh
bash scripts/apply-overlay.sh /path/to/deepseek-harness
```

脚本按相对路径把 `overlay/` 覆盖到目标检出，随后可用 `git diff` 查看或 `git checkout -- .` 回滚。

> ⚠️ overlay 基于上文的旧基线（2026-09 前后），上游 master 已大幅前进；直接打到最新 master 可能有冲突，建议先切到基线附近再应用，或把 overlay 当作移植参考手工合并。

### 2. 安装 skills

```sh
bash scripts/install-skills.sh            # 默认安装到 ~/.agents/skills/
DSH_SKILLS_DIR=/other/dir bash scripts/install-skills.sh
```

已存在的同名 skill 会跳过，不会覆盖本地修改。

### 3. 安装 preset

```sh
mkdir -p ~/.dsh/.agent-presets/glm-agent
cp presets/glm-agent/* ~/.dsh/.agent-presets/glm-agent/
```

`glm-agent` 是基于 PTC 编码 Agent 的 glm-5.3-flash 预设：persona 内置工具执行铁律（强制真实工具调用、先结论后依据、中文简洁），以 `run_code` 为模型编排面。重启 DSH 后在 agent 预设中选择即可。

### 4. 动态插件（可选）

详见 [dynamic-plugins/](dynamic-plugins/)：4 个已固化的 profile patch 插件（computer-use、mac-perf、turn-rail、concurrent-panes）+ 1 个备查早期版（usage-glass）+ 1 个纯会话级插件源码（task-progress-hud）。

## 收录的 skills（15 个）

| Skill | 用途 |
| --- | --- |
| task-progress-hud | DSH 右下角任务进度条 HUD（配合 task_progress 工具） |
| blender-mcp | Blender MCP 集成（3D 建模控制） |
| huashu-design | 花叔Design —— HTML 高保真原型/幻灯片/动画 + 设计方向顾问 |
| kami | 专业文档排版设计系统（PDF/简历/白皮书） |
| marp | Marp Markdown → PPT 幻灯片 |
| minimax-multimodal-toolkit | MiniMax 多模态（语音/音乐/视频/图像） |
| minimax-pdf | 高视觉质量 PDF 生成/填表/重排 |
| minimax-xlsx | Excel/表格生成与编辑 |
| mmx-cli | MiniMax 媒体生成命令行 |
| monkeygraph-agent | MonkeyGraph 知识图谱服务 |
| openscad-3d-viewer | OpenSCAD 3D 建模 + Blender 渲染 + Three.js 预览 |
| patent-disclosure-skill | 中国专利挖掘与交底书生成全流程 |
| planka | Planka 看板任务管理 |
| playwright_cli | Playwright 浏览器自动化 |
| python-pptx | python-pptx 生成/编辑 PowerPoint |

## 排除项（隐私与许可）

- `sam3-mps`：含内网服务端点与内部项目细节，整目录排除
- `esp32-led`：含局域网设备 IP（192.168.x.x），整目录排除
- `kami/assets/fonts/TsangerJinKai02-W0*.ttf`：仓耳今楷为商用字体，授权不允许公开再分发（本地保留，OFL 协议的 Inter / JetBrainsMono / Newsreader 已收录）
- 所有 `node_modules/`、`__pycache__/`、`.DS_Store`
- `~/.dsh` 下的凭据、会话数据与个人配置（settings.yaml 等）一律不在打包范围

## 许可

[MIT](LICENSE)。`overlay/` 衍生自 MIT 协议的 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（版权归 DeepSeek）；`skills/` 中各 skill 归属其各自作者，仅作个人环境的收录备份。
