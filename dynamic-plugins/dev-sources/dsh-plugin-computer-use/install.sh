#!/bin/sh
# dsh-tool-computer-use 一键安装：把插件复制进 web profile 并挂载 patch 行。
# 用法: sh install.sh
# 说明: web profile 是 patchReload: live，跑完即生效，无需重启。
set -eu

SRC="$(cd "$(dirname "$0")" && pwd)"
PROFILE="$HOME/.dsh/profiles/web"
DEST="$PROFILE/plugins/computer-use"
PATCH="$PROFILE/cordis.patch.yml"

[ -d "$PROFILE" ] || { echo "✗ 没找到 web profile: $PROFILE"; exit 1; }

echo "==> 复制插件文件到 $DEST"
mkdir -p "$DEST"
cp "$SRC/package.json" "$SRC/index.js" "$SRC/macos.js" "$SRC/key-script.js" "$SRC/README.md" "$DEST/"

if grep -q 'tool-computer-use' "$PATCH" 2>/dev/null; then
  echo "==> cordis.patch.yml 已有 tool-computer-use 行，跳过修改"
else
  # 仅当 patch 文件还是出厂模板（空数组）时才整体替换；有自定义内容则拒绝自动改。
  if [ "$(grep -v '^#' "$PATCH" | tr -d '[:space:]')" = "[]" ]; then
    cat > "$PATCH" << 'EOF'
# Your patch layer for this dsh profile, applied after every bundle layer:
# a top-level YAML array of loader patch entries (id-targeted config
# overrides, disables, and insert lists; `!!js` expressions allowed).
- insert:
    - id: tool-computer-use
      name: './plugins/computer-use/index.js'
      config:
        allowedActions: [screenshot, cursor_position, left_click, double_click, right_click, move, drag, type, key, scroll, wait]
EOF
    echo "==> 已写入 patch 行"
  else
    echo "✗ $PATCH 已有自定义内容，请手动追加以下行（顶层列表项）："
    cat << 'EOF'

- insert:
    - id: tool-computer-use
      name: './plugins/computer-use/index.js'
      config:
        allowedActions: [screenshot, cursor_position, left_click, double_click, right_click, move, drag, type, key, scroll, wait]
EOF
    exit 1
  fi
fi

echo ""
echo "✅ 安装完成。web profile 是 live reload，保存后自动重组合。"
echo "   验证：tail -f /tmp/dsh-web.log 看有没有 loader 报错；然后让模型调用 computer 工具。"
echo ""
echo "⚠️  权限提醒（macOS TCC，授予后需重启 dsh）："
echo "   1. 屏幕录制: 系统设置 → 隐私与安全性 → 屏幕录制 → 勾选启动 dsh 的终端 App"
echo "   2. 辅助功能: 系统设置 → 隐私与安全性 → 辅助功能 → 勾选同一 App"
echo "   3. 可选: brew install cliclick  # 双击/右键/移动/拖拽需要"
