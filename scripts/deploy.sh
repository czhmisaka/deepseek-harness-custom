#!/usr/bin/env bash
# 把 deepseek-harness-custom 部署到一个新的（或已有的）DSH 环境。
#
# 两种安装路径：
#   A. 源码安装（有 deepseek-harness 检出）：传 --harness，应用 overlay，功能全量
#   B. 发布版安装（npx @deepseek-ai/dsh）：不传 --harness，只装 profile 插件/skills/preset
#
# 用法:
#   bash scripts/deploy.sh [--harness /path/to/deepseek-harness] \
#        [--dsh-home ~/.dsh] [--skills-dir ~/.agents/skills] [--yes]
#
# 幂等：已存在的插件/skill/preset 一律跳过不覆盖，可安全重跑。
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
HARNESS=""
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
SKILLS_DIR="${DSH_SKILLS_DIR:-$HOME/.agents/skills}"
YES=0

while [ $# -gt 0 ]; do
  case "$1" in
    --harness) HARNESS="$2"; shift 2 ;;
    --dsh-home) DSH_HOME="$2"; shift 2 ;;
    --skills-dir) SKILLS_DIR="$2"; shift 2 ;;
    --yes) YES=1; shift ;;
    *) echo "未知参数: $1" >&2; exit 1 ;;
  esac
done

note() { printf '\n== %s\n' "$*"; }
ok() { printf '  [ok] %s\n' "$*"; }
warn() { printf '  [!!] %s\n' "$*" >&2; }

if [ "$YES" -ne 1 ]; then
  echo "部署计划:"
  echo "  harness overlay : ${HARNESS:-（未传 --harness，跳过）}"
  echo "  profile 插件    : $DSH_HOME/profiles/web/plugins/"
  echo "  skills          : $SKILLS_DIR/"
  echo "  preset          : $DSH_HOME/.agent-presets/"
  printf '继续? [y/N] '
  read -r ans
  case "$ans" in y|Y) ;; *) exit 0 ;; esac
fi

BASELINE=4e84901e6471b79ec0338099867ebb4606d12bb5

# ── 1/4 harness overlay ─────────────────────────────────────────────
if [ -n "$HARNESS" ]; then
  note "1/4 应用 overlay 到 $HARNESS"
  [ -d "$HARNESS/.git" ] || { echo "错误: $HARNESS 不是 git 仓库" >&2; exit 1; }
  CUR="$(git -C "$HARNESS" rev-parse HEAD)"
  if [ "$CUR" != "$BASELINE" ]; then
    warn "目标 HEAD ($CUR) 不是 overlay 基线 ($BASELINE)，上游前进后直接覆盖可能冲突"
    warn "建议先: git -C $HARNESS checkout $BASELINE"
  fi
  if [ -n "$(git -C "$HARNESS" status --porcelain)" ]; then
    warn "目标工作区不干净，overlay 将叠加在未提交改动之上（回滚: git checkout -- .）"
  fi
  rsync -a "$REPO/overlay/" "$HARNESS/"
  ok "已覆盖 $(find "$REPO/overlay" -type f | wc -l | tr -d ' ') 个文件（详见 MANIFEST.md）"
else
  note "1/4 harness overlay: 跳过（发布版安装路径，usage ledger / 液态玻璃主题不可用）"
fi

# ── 2/4 profile 插件 ────────────────────────────────────────────────
note "2/4 profile 插件 → $DSH_HOME/profiles/web/plugins/"
mkdir -p "$DSH_HOME/profiles/web/plugins"
for dir in "$REPO"/dynamic-plugins/web-profile/plugins/*/; do
  name="$(basename "$dir")"
  if [ "$name" = "usage-glass" ]; then
    echo "  [skip] usage-glass（未挂载备查，尝试挂载见 DEPLOY.md）"
    continue
  fi
  if [ -e "$DSH_HOME/profiles/web/plugins/$name" ]; then
    echo "  [skip] 已存在: $name"
  else
    cp -R "$dir" "$DSH_HOME/profiles/web/plugins/$name"
    ok "$name"
  fi
done

# ── patch 配置 ──────────────────────────────────────────────────────
PATCH="$DSH_HOME/profiles/web/cordis.patch.yml"
if [ ! -f "$PATCH" ] || ! grep -qvE '^[[:space:]]*(#|\[\]|$)' "$PATCH"; then
  mkdir -p "$(dirname "$PATCH")"
  cp "$REPO/dynamic-plugins/web-profile/cordis.patch.yml" "$PATCH"
  ok "cordis.patch.yml 已写入（原本缺失/为空）"
else
  warn "$PATCH 已有你自己的条目，未自动合并。"
  warn "请从 $REPO/dynamic-plugins/web-profile/cordis.patch.yml 把 insert 条目"
  warn "（tool-computer-use / mac-perf / turn-rail / concurrent-panes）抄进其 insert 列表。"
fi

# ── 3/4 skills ──────────────────────────────────────────────────────
note "3/4 skills → $SKILLS_DIR/"
bash "$REPO/scripts/install-skills.sh" "$SKILLS_DIR" | tail -1

# ── 4/4 preset ──────────────────────────────────────────────────────
note "4/4 preset → $DSH_HOME/.agent-presets/"
PRESET_DIR="$DSH_HOME/.agent-presets/glm-agent"
if [ -e "$PRESET_DIR" ]; then
  echo "  [skip] 已存在: glm-agent"
else
  mkdir -p "$PRESET_DIR"
  cp "$REPO"/presets/glm-agent/* "$PRESET_DIR/"
  ok glm-agent
fi

echo
echo "部署完成。下一步："
if [ -n "$HARNESS" ]; then
  echo "  cd $HARNESS && pnpm install   # Node ^22.19 || >=24"
  echo "  pnpm dsh web                  # 或 npx @deepseek-ai/dsh 见 DEPLOY.md 发布版路径"
else
  echo "  npx @deepseek-ai/dsh web"
fi
echo "  computer-use: 需授予终端 屏幕录制/辅助功能 权限；双击右键拖拽需 brew install cliclick"
echo "  进度条 HUD: 在 dsh 会话里让 agent 按 dynamic-plugins/task-progress-hud/README.md 重新部署"
