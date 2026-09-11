#!/usr/bin/env bash
# 把 overlay/ 应用到一个 deepseek-harness 检出：按相对路径覆盖同名文件。
# 用法: apply-overlay.sh /path/to/deepseek-harness
# 回滚: 在目标检出里执行 git checkout -- . （应用前最好保持工作区干净）
set -euo pipefail

TARGET="${1:?用法: apply-overlay.sh /path/to/deepseek-harness}"
SRC="$(cd "$(dirname "$0")/.." && pwd)/overlay"

[ -d "$SRC" ] || { echo "错误: 找不到 $SRC" >&2; exit 1; }
command -v rsync >/dev/null || { echo "错误: 需要 rsync" >&2; exit 1; }

if [ -e "$TARGET/.git" ]; then
  if [ -n "$(git -C "$TARGET" status --porcelain)" ]; then
    echo "警告: 目标工作区不干净，overlay 会叠加在未提交改动之上" >&2
  fi
else
  echo "警告: $TARGET 不是 git 仓库，无法用 git 回滚" >&2
fi

rsync -a "$SRC"/ "$TARGET"/
echo "已应用 overlay 到 $TARGET"
echo "查看改动: git -C $TARGET status --short"
echo "回滚改动: git -C $TARGET checkout -- . （未跟踪新文件需手动删除，见 MANIFEST.md）"
