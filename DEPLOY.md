# 部署到新 DSH

从本仓库把个人定制层部署到一台新机器（或新装）的 DeepSeek Harness 上。`scripts/deploy.sh` 是幂等的：已存在的插件/skill/preset 一律跳过，可安全重跑。

## 路径 A：源码安装（推荐，功能全量）

overlay 是对上游源码树的差异，需要一份 deepseek-harness 检出来承载 usage ledger、液态玻璃主题等自研插件包。

```sh
# 1. 克隆上游与本仓库
git clone https://github.com/deepseek-ai/deepseek-harness
git clone https://github.com/czhmisaka/deepseek-harness-custom

# 2. 检出 overlay 基线（重要：直接打最新 master 可能冲突，见下"基线漂移"）
cd deepseek-harness
git checkout 4e84901e6471b79ec0338099867ebb4606d12bb5

# 3. 一键部署（overlay + profile 插件 + patch + 15 skills + glm-agent preset）
bash ../deepseek-harness-custom/scripts/deploy.sh --harness "$PWD" --yes

# 4. 装依赖、启动（Node ^22.19 || >=24，pnpm workspaces）
pnpm install
pnpm dsh web
```

## 路径 B：发布版安装（npx，最快但无 overlay 功能）

```sh
git clone https://github.com/czhmisaka/deepseek-harness-custom
cd deepseek-harness-custom
bash scripts/deploy.sh --yes        # 不传 --harness
npx @deepseek-ai/dsh web
```

发布版没有源码树，overlay（usage ledger、液态玻璃主题、`/usage` 命令）**不可用**；4 个 profile 插件、15 个 skills、glm-agent preset 全部照常工作。
`dynamic-plugins/web-profile/plugins/usage-glass/` 是这两个功能的早期打包版（未验证挂载），如需在无源码树上尝试：在 patch 的 insert 列表加 `- id: usage-glass` / `name: './plugins/usage-glass/host.js'` 并把该目录拷进 `plugins/`，以实际加载结果为准。

## deploy.sh 做了什么

| 步骤 | 动作 | 回滚 |
| --- | --- | --- |
| overlay | rsync 覆盖到 harness 检出（111 个文件，见 MANIFEST.md） | `git checkout -- .` |
| profile 插件 | 拷 4 个已挂载插件到 `~/.dsh/profiles/web/plugins/`（usage-glass 跳过） | 删对应目录 |
| patch 配置 | 目标 `cordis.patch.yml` 缺失或为空（`[]`/仅注释）→ 整文件写入；**已有条目 → 只提示手动合并，不覆盖** | 删对应 insert 条目 |
| skills | 拷入 `~/.agents/skills/`，同名跳过 | 删对应目录 |
| preset | 拷入 `~/.dsh/.agent-presets/glm-agent/`，已存在跳过 | 删目录 |

自定义位置：`--dsh-home DIR`、`--skills-dir DIR`（或环境变量 `DSH_HOME`/`DSH_SKILLS_DIR`）。

## 基线漂移

overlay 基于上游 `4e84901e64`（dsh-0.1.2-alpha.4 合并点，2026-09 前后），上游 master 已前进千余提交。deploy.sh 检测到目标 HEAD 非基线会告警；两种处理：

1. **停在基线跑**（默认，最稳）：`git checkout 4e84901e64`
2. **移植到新版**：checkout 最新 master 后加 `--yes` 强打 overlay，然后逐个 `git diff` 审查冲突文件手工修（自研核心只有 3 个新插件包 + 少量配套改动，移植面可控）

## 部署后注意

- **computer-use**：macOS 需在 系统设置→隐私与安全性 给启动 dsh 的终端授予 屏幕录制 + 辅助功能；双击/右键/移动/拖拽需 `brew install cliclick`；重启 dsh 生效
- **task-progress HUD（进度条）**：会话级动态插件，进程重启即失。部署方法：在新 dsh 会话里让 agent「按 `dynamic-plugins/task-progress-hud/README.md` 用 cordis_define/cordis_run 部署进度条插件」，client 半首次需点 ✓ 授权；也可按其说明固化为 profile patch 行
- **glm-agent preset**：preset 本体不含密钥；其默认模型 glm-5.3-flash 的端点/密钥是环境相关配置（`~/.dsh/settings.yaml` 或凭据文件，不在本仓库），新环境需自行配置模型路由
- **web profile 是 patchReload: live**：改 `cordis.patch.yml` 保存即热重载，无需重启
