#!/usr/bin/env bash
# 把 skills/ 下的每个 skill 安装到目标 skills 目录（默认 ~/.agents/skills/）。
# 用法: install-skills.sh [目标目录]（或用环境变量 DSH_SKILLS_DIR 指定）
# 已存在的同名 skill 会跳过，不覆盖本地修改。
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)/skills"
DEST="${1:-${DSH_SKILLS_DIR:-$HOME/.agents/skills}}"

[ -d "$SRC" ] || { echo "错误: 找不到 $SRC" >&2; exit 1; }
mkdir -p "$DEST"

installed=0
skipped=0
for dir in "$SRC"/*/; do
  name="$(basename "$dir")"
  if [ -e "$DEST/$name" ]; then
    echo "跳过（已存在）: $DEST/$name"
    skipped=$((skipped + 1))
  else
    cp -R "$dir" "$DEST/$name"
    echo "已安装: $DEST/$name"
    installed=$((installed + 1))
  fi
done

echo "完成：新装 $installed 个，跳过 $skipped 个（目标：$DEST）"
