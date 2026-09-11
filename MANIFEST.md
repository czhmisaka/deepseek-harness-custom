# MANIFEST

## 基线

- 差异基线（merge-base）：`4e84901e6471b79ec0338099867ebb4606d12bb5`（上游 dsh-0.1.2-alpha.4 合并点）
- 本地 HEAD：`60a731d53b` + 工作区未提交改动
- 导出时间：2026-09-11 14:58 CST

## 本地提交（36 个，按时间正序）

- `57aab9f96d` feat(usage): durable cross-session token usage ledger with /usage command and web dashboard
- `06ea7b9f4e` feat(usage): add the all-sessions usage bubble to the shell overlay
- `930f8762fd` feat(usage): make the all-sessions bubble draggable with a persisted position
- `64553fb233` feat(theme): add the Liquid Glass theme with frosted surfaces and backdrop blur
- `00b9a02af7` feat(theme): mount the matrix rain wallpaper behind the Liquid Glass theme
- `491f969eac` style(theme): densify the matrix rain grid (font-size 16 to 11)
- `21cdb31c40` feat(usage): add the per-session table and usage-over-time chart to the dashboard
- `e7cc960d3c` feat(usage): add hour-level statistics with a 24-hour chart range
- `d33c0f7e25` feat(usage): colorize the dashboard with palette tokens and share bars
- `252bd20956` feat(usage): add precision affordances - exact hovers, gridline, composition bar
- `ef5139a04e` feat(theme): swap the Liquid Glass wallpaper to the sea background
- `8fd88f5518` feat(theme): dedicated Liquid Glass settings page with live parameter controls
- `0e94e37daf` fix(theme): drive the Liquid Glass section from a store with a durable settings document
- `bed0e73f71` feat(usage): scale token counts through B and T tiers
- `b59e2d5497` feat(theme): digital sea — screen-anchored multi-window ocean with layered effects
- `804515a60b` feat(theme): multi-style sea — ghibli anime waves with style/view settings
- `85d66747ec` fix(theme): restore THEME_KEYS declaration lost in the multi-style regeneration
- `3d8e4437f7` feat(theme): lock the ghibli camera to top-down — retire the side view
- `fa943b3827` perf(theme): render the sea at 0.75x resolution and reuse the shared band phase
- `a7c83b77cb` feat(theme): real WebGL refraction pass over the sea inside glass panes
- `319c954a57` fix(theme): leftover 'cr' reference in the refraction FRAG renamed to cornerR
- `e01c0eb4e9` fix(theme): lint-clean the refraction pass — makeShader helper, drop non-null asserts
- `69bc14f3c1` fix(theme): raise refraction canvas z-index above the sea layer
- `a467eb4724` fix(theme): escape real newlines in the embedded FRAG strings (black screen)
- `633068d3fd` fix(theme): de-quote attribute selectors in glass.css — lightningcss escape bug
- `aa0ae2da8c` fix(theme): bleed the frame 20px beyond the viewport so card margins don't squeeze content
- `8fb1f079df` chore(theme): remove the refraction pass — cancelled by the user
- `66f8466247` revert(theme): remove card layout — back to full-width columns
- `0f60ef496c` feat(theme): set bg-base and sidebar-fill to fully transparent — the sea shows through the entire UI
- `92b13ad271` feat(theme): darken the sidebar fill to rgba(0,0,0,0.35)
- `f53424d33b` feat(theme): lighten the sidebar fill to rgba(0,0,0,0.05)
- `cc3893a8f9` feat(theme): sidebar backdrop blur to 2px (frosted glass)
- `44d0ff6533` fix(theme): remove -webkit-backdrop-filter prefixes — Chrome requires the standard property
- `50c884c28e` fix(ui-theme-liquid-glass): move column backdrop blur to ::before layers
- `d939f8fb41` fix(ui-theme-liquid-glass): keep settings modal above the center column
- `60a731d53b` feat(ui-theme-liquid-glass): add a pixel ocean style

## overlay 差异文件（111 个，相对上游仓库路径）

```
.agents/notes/implemented/feature/2026-09-04-usage-ledger.i18n.yaml
.agents/notes/implemented/feature/2026-09-04-usage-ledger.md
.agents/notes/implemented/feature/2026-09-04-usage-ledger.zh.md
.agents/notes/implemented/feature/2026-09-07-digital-sea-screen-anchored-ocean.md
.agents/notes/implemented/feature/2026-09-09-liquid-glass-pixel-ocean-mode.md
.agents/notes/implemented/feature/2026-09-09-liquid-glass-pixel-ocean-mode.zh.md
docs/config-catalog.i18n.yaml
docs/config-catalog.md
docs/config-catalog.zh.md
docs/user/guide/python-sdk.i18n.yaml
docs/user/guide/python-sdk.md
docs/user/guide/python-sdk.zh.md
packages/api/remotes/package.json
packages/api/remotes/src/client/index.ts
packages/bundle/acp-app/README.i18n.yaml
packages/bundle/acp-app/README.md
packages/bundle/acp-app/README.zh.md
packages/bundle/acp-app/cordis.patch.yml
packages/bundle/base/cordis.patch.yml
packages/bundle/base/package.json
packages/bundle/web-app/cordis.patch.yml
packages/bundle/web-app/package.json
packages/client/README.i18n.yaml
packages/client/README.md
packages/client/README.zh.md
packages/client/ui-theme-liquid-glass/README.i18n.yaml
packages/client/ui-theme-liquid-glass/README.md
packages/client/ui-theme-liquid-glass/README.zh.md
packages/client/ui-theme-liquid-glass/package.json
packages/client/ui-theme-liquid-glass/src/client/LiquidGlassSection.module.css
packages/client/ui-theme-liquid-glass/src/client/LiquidGlassSection.tsx
packages/client/ui-theme-liquid-glass/src/client/glass.css
packages/client/ui-theme-liquid-glass/src/client/index.ts
packages/client/ui-theme-liquid-glass/src/client/locales.ts
packages/client/ui-theme-liquid-glass/src/client/sea-background-script.ts
packages/client/ui-theme-liquid-glass/src/client/sea-wallpaper.ts
packages/client/ui-theme-liquid-glass/src/client/settings-store.ts
packages/client/ui-theme-liquid-glass/src/client/tokens.ts
packages/client/ui-theme-liquid-glass/src/css-modules.d.ts
packages/client/ui-theme-liquid-glass/src/index.ts
packages/client/ui-theme-liquid-glass/src/liquid-glass-settings.ts
packages/client/ui-theme-liquid-glass/tests/sea-wallpaper.client.spec.ts
packages/client/ui-theme-liquid-glass/tsconfig.json
packages/client/ui-theme-liquid-glass/tsdown.config.ts
packages/client/ui-usage/README.i18n.yaml
packages/client/ui-usage/README.md
packages/client/ui-usage/README.zh.md
packages/client/ui-usage/package.json
packages/client/ui-usage/src/client/UsageBubble.module.css
packages/client/ui-usage/src/client/UsageSection.module.css
packages/client/ui-usage/src/client/index.ts
packages/client/ui-usage/src/client/locales.ts
packages/client/ui-usage/src/client/shaping.ts
packages/client/ui-usage/src/client/usage-bubble.tsx
packages/client/ui-usage/src/client/usage-section.tsx
packages/client/ui-usage/src/css-modules.d.ts
packages/client/ui-usage/src/index.ts
packages/client/ui-usage/tests/shaping.client.spec.ts
packages/client/ui-usage/tests/usage-bubble.client.spec.tsx
packages/client/ui-usage/tests/usage-section.client.spec.tsx
packages/client/ui-usage/tsconfig.json
packages/client/ui-usage/tsdown.config.ts
packages/extensions/cordis-client-runner/src/client/slot-catalog.ts
packages/llm/README.i18n.yaml
packages/llm/README.md
packages/llm/README.zh.md
packages/llm/llm-deepseek/README.i18n.yaml
packages/llm/llm-deepseek/README.md
packages/llm/llm-deepseek/README.zh.md
packages/llm/llm-deepseek/src/index.ts
packages/llm/llm-deepseek/tests/adapter.spec.ts
packages/llm/llm-deepseek/tests/dynamic-config.spec.ts
packages/llm/llm/README.i18n.yaml
packages/llm/llm/README.md
packages/llm/llm/README.zh.md
packages/llm/usage-ledger/README.i18n.yaml
packages/llm/usage-ledger/README.md
packages/llm/usage-ledger/README.zh.md
packages/llm/usage-ledger/package.json
packages/llm/usage-ledger/src/display.ts
packages/llm/usage-ledger/src/fold.ts
packages/llm/usage-ledger/src/index.ts
packages/llm/usage-ledger/src/records.ts
packages/llm/usage-ledger/src/types.ts
packages/llm/usage-ledger/tests/loader-composition.spec.ts
packages/llm/usage-ledger/tests/usage-ledger.spec.ts
packages/llm/usage-ledger/tsconfig.json
packages/sdk/client/README.i18n.yaml
packages/sdk/client/README.md
packages/sdk/client/README.zh.md
packages/sdk/client/src/api.ts
packages/sdk/client/src/types.ts
packages/subagent/subagent-dsh-sdk/README.i18n.yaml
packages/subagent/subagent-dsh-sdk/README.md
packages/subagent/subagent-dsh-sdk/README.zh.md
packages/subagent/subagent-dsh-sdk/src/index.ts
packages/web/web-search-deepseek/README.i18n.yaml
packages/web/web-search-deepseek/README.md
packages/web/web-search-deepseek/README.zh.md
packages/web/web-search-deepseek/src/index.ts
packages/web/web-search-deepseek/src/provider.ts
packages/web/web-search-deepseek/tests/deepseek.spec.ts
pnpm-lock.yaml
python/sdk/README.i18n.yaml
python/sdk/README.md
python/sdk/README.zh.md
python/sdk/src/deepseek_harness/api.py
snapshots/session/web-search-endpoint-guidance/session.jsonl
tsconfig.base.json
tsconfig.client.json
tsconfig.host.json
```
