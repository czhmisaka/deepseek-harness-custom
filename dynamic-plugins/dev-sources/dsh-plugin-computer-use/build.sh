#!/bin/sh
# 构建 client bundle 并同步全部文件到运行中的 web profile。
# 用法: sh build.sh
#
# ⚠️ client 产物格式（强制，勿改回 format:'esm'）：
# dsh 的 web 客户端把所有插件的 ./client 产物拼进同一个「经典 <script>」执行，
# loader 要求每个插件以 CJS 形式 self-register：
#   window.__ModuleLoader__.load({ id, factory: (require) => { ...; return module.exports } })
# 裸 ESM（import/export）会让整个 bundle 抛
#   "Cannot use import statement outside a module"
# 并把所有其它插件一起拖挂（典型：loaded without registering ... via __ModuleLoader__.load）。
#  → 这里用 esbuild 出 CJS，再统一在外层包 __ModuleLoader__.load wrapper。
set -eu
ROOT="$(cd "$(dirname "$0")" && pwd)"
ESBUILD="$(node -e "console.log(require.resolve('esbuild/lib/main.js'))")"

echo "==> 构建 lib/client.js（CJS + loader wrapper）"
cat > /tmp/dsh-cu-build.mjs << EOF
import { build } from '$ESBUILD'
await build({
  entryPoints: ['$ROOT/src/client.js'],
  bundle: true, format: 'cjs', platform: 'browser', jsx: 'automatic',
  loader: { '.js': 'jsx' },
  external: ['react', 'react/jsx-runtime', '@deepseek-ai/cordis'],
  outfile: '$ROOT/.client.cjs.tmp',
  logLevel: 'info',
})
EOF
node /tmp/dsh-cu-build.mjs

echo "==> 包成 __ModuleLoader__.load 形式"
python3 - "$ROOT" <<'PY'
import sys
root = sys.argv[1]
body = open(root + '/.client.cjs.tmp', encoding='utf-8').read()
w = ('window.__ModuleLoader__.load({\n'
     '\tid: "dsh-tool-computer-use",\n'
     '\tfactory: (require) => {\n'
     '\t\tvar module = { exports: {} };\n'
     '\t\tvar exports = module.exports;\n'
     '\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });\n')
t = '\t\treturn module.exports;\n\t}\n});\n'
out = w + '\n'.join(('\t\t' + l) if l.strip() else '' for l in body.split('\n')) + '\n' + t
open(root + '/lib/client.js', 'w', encoding='utf-8').write(out)
print('wrote', root + '/lib/client.js')
PY
rm -f "$ROOT/.client.cjs.tmp"

echo "==> 同步到 profile"
DEST="$HOME/.dsh/profiles/web/plugins/computer-use"
mkdir -p "$DEST/lib"
cp "$ROOT/package.json" "$ROOT/index.js" "$ROOT/macos.js" "$ROOT/key-script.js" "$ROOT/README.md" "$DEST/"
cp "$ROOT/src/client.js" "$ROOT/src/client-settings.js" "$DEST/" 2>/dev/null || true
cp "$ROOT/lib/client.js" "$DEST/lib/client.js"

echo "==> 触发 live reload（touch patch 文件）"
touch "$HOME/.dsh/profiles/web/cordis.patch.yml"
echo "✅ 完成"
