/**
 * Turn-rail timeline — browser half.
 *
 * Turns the shipped right-hand turn navigation rail (the fixed-pitch ladder of
 * turn ticks inside the chat scrollport) into a readable timeline: a spine, a
 * clearer tick hierarchy, turn ordinals drawn by CSS counters, a wider hover
 * target, and a richer preview card. It restyles the rail through an injected
 * stylesheet only — no product DOM is created, moved, or read.
 *
 * Settings → Turn rail owns the controls. The preview stage renders a mock
 * rail carrying the same anchor attribute and the same `_mark*` class names as
 * the product's own markup, so the very stylesheet that restyles the real rail
 * also drives the preview: what the stage shows is what the rail does.
 *
 * Static-plugin rules: the module must self-register through
 * `__ModuleLoader__.load` as CJS, React comes from the platform module table,
 * and every `ctx.<service>` read is declared in `inject`.
 * @module dsh-turn-rail/client
 */

window.__ModuleLoader__.load({
  id: 'dsh-turn-rail',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    const React = require('react');

    const name = 'turn-rail'
    const inject = ['slots', 'locale', 'settingsScope', 'timer']

    /** Settings namespace owned by the host half. */
    const NS = 'turn-rail'
    /** The rail's frame carries this custom property and nothing else does. */
    const RAIL = 'nav[style*="--turn-natural-height"]'
    const TICK = RAIL + ' [class*="_markPosition"]>button'

    /** Field defaults; also the shape the durable section is normalized into. */
    const DEFAULTS = {
      variant: 'standard',
      enabled: true,
      spine: true,
      spineWidth: 2,
      ordinals: true,
      hoverGrow: true,
      halo: true,
      hitWidth: 48,
      cardUpgrade: true,
      cardWidth: 340,
      promptLines: 2,
      unloadedBadge: true,
      usage: true,
      usageDetail: true,
      usageHeat: false,
    }

    /** Boolean fields, normalized as a group. */
    const FLAGS = ['enabled', 'spine', 'ordinals', 'hoverGrow', 'halo', 'cardUpgrade', 'unloadedBadge',
      'usage', 'usageDetail', 'usageHeat']
    /** Integer fields with their accepted ranges. */
    const RANGES = {
      spineWidth: [1, 4],
      hitWidth: [28, 80],
      cardWidth: [260, 480],
      promptLines: [1, 4],
    }
    /** Fields only meaningful while the upgraded preview card is on. */
    const CARD_FIELDS = ['cardWidth', 'promptLines', 'unloadedBadge']
    /** Ceiling on per-turn usage rules, so a very long session cannot bloat the sheet. */
    const USAGE_RULE_LIMIT = 400
    /** Stage demo curve: what the preview shows before any session is displayed. */
    const STAGE_USAGE = [
      420000, 1150000, 2582030, 780000, 3120000, 610000, 1840000, 940000, 4210000,
    ]

    /** Preset field sets, least to most decorated. */
    const PRESETS = {
      off: { enabled: false },
      minimal: {
        enabled: true, spine: true, spineWidth: 2, ordinals: false, hoverGrow: false,
        halo: false, hitWidth: 48, cardUpgrade: false, cardWidth: 340, promptLines: 2, unloadedBadge: false,
      },
      standard: {
        enabled: true, spine: true, spineWidth: 2, ordinals: true, hoverGrow: true,
        halo: true, hitWidth: 48, cardUpgrade: true, cardWidth: 340, promptLines: 2, unloadedBadge: true,
      },
      strong: {
        enabled: true, spine: true, spineWidth: 3, ordinals: true, hoverGrow: true,
        halo: true, hitWidth: 60, cardUpgrade: true, cardWidth: 380, promptLines: 3, unloadedBadge: true,
      },
    }

    /** Preset ids in display order. */
    const PRESET_IDS = ['off', 'minimal', 'standard', 'strong']

    /** CSS string-escape non-ASCII text so injected rules carry no raw glyphs. */
    function cssText(text) {
      var out = ''
      for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i)
        if (code < 128) out += text.charAt(i)
        else {
          var hex = code.toString(16).toUpperCase()
          while (hex.length < 4) hex = '0' + hex
          out += '\\' + hex + ' '
        }
      }
      return out
    }

    /** Every page string, per language. */
    function strings(lang) {
      if (lang === 'zh') {
        return {
          sectionLabel: '对话轮次导航',
          title: '对话轮次导航时间轴',
          desc: '把对话区最右侧那排轮次刻度做成真正的历史时间轴：一条贯穿的脊线、分明的刻度层次、轮次序号、更宽的悬停热区，以及信息更全的悬停预览卡。下面的实时预览与实际效果使用同一套样式。',
          previewTitle: '实时预览',
          previewHint: '把鼠标移到预览上，悬停放大也会真实发生',
          stageHint: '示例：第 3 轮悬停中 · 第 9 轮为当前轮',
          samplePrompt: '这条消息的摘要示例，卡片里最多显示设定的行数',
          sampleResponse: '回复摘要示例。开启「未加载标注」后，仍需翻页载入的历史轮次会额外标注，便于区分已载入与待载入的内容。',
          presetsTitle: '强度档位',
          controlsTitle: '细项控制',
          controlsHint: '改动任一项会记为「自定义」',
          customHint: '已手动调整，不再等于任何预设档位',
          reset: '恢复默认',
          optionEnabled: '启用',
          optionSpine: '贯穿脊线',
          hintSpine: '用一条竖线把刻度串成时间轴',
          optionSpineWidth: '脊线粗细',
          optionOrdinals: '轮次序号',
          hintOrdinals: '当前轮常显，悬停与聚焦时显示对应序号',
          optionHoverGrow: '悬停放大',
          hintHoverGrow: '鼠标进入刻度条时，整排刻度一起变长',
          optionHalo: '当前轮光晕',
          hintHalo: '给当前轮加一层品牌色柔光，一眼定位',
          optionHitWidth: '悬停热区宽度',
          hintHitWidth: '',
          optionCardUpgrade: '升级预览卡',
          hintCardUpgrade: '加宽卡片、多行摘要、标题徽标与正文分隔线',
          optionCardWidth: '卡片宽度',
          optionPromptLines: '摘要行数',
          optionUnloadedBadge: '未加载标注',
          hintUnloadedBadge: '预览卡上标出该轮是否尚未载入',
          optionUsage: '每轮 token 用量',
          hintUsage: '悬停刻度或看预览卡，都能知道这一轮花了多少 token',
          optionUsageDetail: '用量明细',
          hintUsageDetail: '在卡片里再列出输入 / 输出 / 缓存命中',
          optionUsageHeat: '用量热力条',
          hintUsageHeat: '每轮用量按比例画在刻度后面，一眼看出哪几轮最贵',
          usageCache: '缓存',
          usageUnit: ' tok',
          unitPx: 'px',
          unitLine: ' 行',
          badgePre: '第 ',
          badgePost: ' 轮',
          badgeUnloadedPost: ' 轮 · 未加载',
          presets: {
            off: { title: '关闭', hint: '保留产品原样，不注入任何样式' },
            minimal: { title: '精简', hint: '只加脊线、刻度层次与更宽热区' },
            standard: { title: '标准', hint: '再加轮次序号、悬停放大与升级预览卡' },
            strong: { title: '强调', hint: '更粗的脊线、更宽的热区与更大的卡片' },
          },
        }
      }
      return {
        sectionLabel: 'Turn rail',
        title: 'Turn rail timeline',
        desc: 'Turns the right-hand ladder of turn ticks into a real history timeline: a continuous spine, a clearer tick hierarchy, turn ordinals, a wider hover target and a richer hover preview. The live preview below is driven by the same stylesheet as the rail itself.',
        previewTitle: 'Live preview',
        previewHint: 'Hover the preview: the hover growth happens for real',
        stageHint: 'Sample: turn 3 hovered · turn 9 is current',
        samplePrompt: 'A sample prompt summary, clipped at the configured line count',
        sampleResponse: 'A sample answer summary. With "Not-loaded badge" on, history turns that still need paging in are labelled as not loaded.',
        presetsTitle: 'Intensity',
        controlsTitle: 'Fine controls',
        controlsHint: 'any change marks the preset as custom',
        customHint: 'Hand-tuned, no longer equal to any preset',
        reset: 'Reset to defaults',
        optionEnabled: 'Enabled',
        optionSpine: 'Continuous spine',
        hintSpine: 'One vertical line the ticks hang from',
        optionSpineWidth: 'Spine weight',
        optionOrdinals: 'Turn ordinals',
        hintOrdinals: 'Current turn always, hovered and focused turns on demand',
        optionHoverGrow: 'Hover growth',
        hintHoverGrow: 'Every tick grows while the pointer works the rail',
        optionHalo: 'Active-turn halo',
        hintHalo: 'A brand-tinted glow on the current turn',
        optionHitWidth: 'Hover target width',
        hintHitWidth: '',
        optionCardUpgrade: 'Upgraded preview card',
        hintCardUpgrade: 'Wider card, multi-line summary, title badge and divider',
        optionCardWidth: 'Card width',
        optionPromptLines: 'Summary lines',
        optionUnloadedBadge: 'Not-loaded badge',
        hintUnloadedBadge: 'Marks whether the previewed turn still needs paging in',
        optionUsage: 'Per-turn token usage',
        hintUsage: 'See what a turn spent — on its tick and in the preview card',
        optionUsageDetail: 'Usage breakdown',
        hintUsageDetail: 'Adds input / output / cache rows inside the card',
        optionUsageHeat: 'Usage heat bands',
        hintUsageHeat: 'Draws each turn’s usage behind its tick so costly turns stand out',
        usageCache: 'cache',
        usageUnit: ' tok',
        unitPx: 'px',
        unitLine: ' lines',
        badgePre: 'Turn ',
        badgePost: '',
        badgeUnloadedPost: ' · not loaded',
        presets: {
          off: { title: 'Off', hint: 'Shipped look, no stylesheet injected' },
          minimal: { title: 'Minimal', hint: 'Spine, tick hierarchy and a wider hover target' },
          standard: { title: 'Standard', hint: 'Adds turn ordinals, hover growth and the preview card' },
          strong: { title: 'Strong', hint: 'Heavier spine, wider target, larger card' },
        },
      }
    }

    /** Clamp one numeric field onto its accepted range. */
    function clampNumber(value, key) {
      var range = RANGES[key]
      if (typeof value !== 'number' || !isFinite(value)) return DEFAULTS[key]
      return Math.min(range[1], Math.max(range[0], Math.round(value)))
    }

    /** Normalize one durable section into the shape the page and CSS read. */
    function normalize(section) {
      var out = {}
      for (var key in DEFAULTS) out[key] = DEFAULTS[key]
      if (section === undefined || section === null || typeof section !== 'object') return out
      for (var i = 0; i < FLAGS.length; i++) {
        var flag = FLAGS[i]
        if (typeof section[flag] === 'boolean') out[flag] = section[flag]
      }
      for (var key2 in RANGES) out[key2] = clampNumber(section[key2], key2)
      if (typeof section.variant === 'string') out.variant = section.variant
      return out
    }

    /** Which preset the current fields equal, or `custom`. */
    function presetOf(config) {
      if (!config.enabled) return 'off'
      for (var i = 1; i < PRESET_IDS.length; i++) {
        var fields = PRESETS[PRESET_IDS[i]]
        var same = true
        for (var key in fields) {
          if (config[key] !== fields[key]) { same = false; break }
        }
        if (same) return PRESET_IDS[i]
      }
      return 'custom'
    }

    /**
     * Enhancement stylesheet for the rail, derived from the current fields.
     * Empty while the master switch is off, which leaves the shipped rail.
     * @param {object} config - normalized field values.
     * @param {string} lang - 'zh' or anything else for English.
     * @returns {string} the injected rules.
     */
    function railCss(config, lang) {
      if (!config.enabled) return ''
      var text = strings(lang)
      var parts = []
      function rule(selector, body) { parts.push(selector + '{' + body + '}') }
      function mix(token, alpha) {
        return 'color-mix(in srgb,var(--dsw-alias-' + token + ') ' + alpha + '%,transparent)'
      }

      // Geometry: the interaction column widens, ticks keep their right anchor.
      // Usage digits ride the label, so the column reserves room for them.
      var tall = config.cardUpgrade && config.usage && config.usageDetail
      rule(RAIL, 'width:' + frameWidth(config) + 'px;--turn-preview-height:' + (tall ? 176 : 150) + 'px')

      if (config.spine) {
        rule(RAIL + '::before', 'content:"";position:absolute;top:7px;bottom:7px;right:1px;width:' + config.spineWidth
          + 'px;border-radius:2px;pointer-events:none;background:linear-gradient(to bottom,transparent 0,'
          + mix('label-primary', 16) + ' 14%,' + mix('label-primary', 16) + ' 86%,transparent 100%)')
      }

      rule(TICK + '::before', 'right:0;width:12px;height:2px;border-radius:2px;background:' + mix('label-primary', 38)
        + ';transition:width 150ms cubic-bezier(.2,.8,.2,1),height 150ms cubic-bezier(.2,.8,.2,1),'
        + 'background-color 150ms ease,box-shadow 150ms ease')
      rule(TICK + '[class*="_markUnloaded"]::before', 'width:7px;opacity:1;background:' + mix('label-primary', 22))
      rule(TICK + '[class*="_markPreview"]::before', 'width:22px;background:' + mix('label-primary', 68))
      rule(TICK + ':focus-visible::before', 'width:22px;background:var(--dsw-alias-state-business-primary)')
      rule(TICK + '[class*="_markActive"]::before', 'width:26px;height:3px;background:var(--dsw-alias-label-primary)'
        + (config.halo ? ';box-shadow:0 0 9px ' + mix('brand-primary', 55) : ''))

      if (config.hoverGrow) {
        rule(RAIL + ':hover ' + TICK + ':not([class*="_markActive"]):not([class*="_markPreview"])::before', 'width:14px')
      }
      rule(TICK + '[class*="_markBusy"]::before',
        'background:var(--dsw-alias-brand-primary);animation:dsh-rail-busy 1.1s ease-in-out infinite')
      parts.push('@keyframes dsh-rail-busy{0%,100%{width:14px;opacity:1}50%{width:30px;opacity:.5}}')

      if (config.ordinals) {
        // Turn ordinal from the rail's own mark order; no DOM writes involved.
        rule(RAIL + ' [class*="_marks"]', 'counter-reset:dsh-rail-turn')
        rule(RAIL + ' [class*="_markPosition"]', 'counter-increment:dsh-rail-turn')
        rule(TICK + '::after', 'content:counter(dsh-rail-turn);position:absolute;top:50%;right:30px;'
          + 'transform:translateY(-50%);font-size:10px;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:.02em;'
          + 'color:' + mix('label-primary', 42) + ';opacity:0;transition:opacity 150ms ease;pointer-events:none;white-space:nowrap')
        rule(TICK + '[class*="_markActive"]::after,' + TICK + '[class*="_markPreview"]::after,'
          + TICK + ':focus-visible::after', 'opacity:1')
        rule(TICK + '[class*="_markActive"]::after', 'color:' + mix('label-primary', 72))
      }

      if (config.cardUpgrade) {
        // The previewed mark carries its own index * 10px offset, which is the
        // only ordinal source the card can read without touching product DOM.
        var badge = '"' + cssText(text.badgePre) + '" counter(dsh-rail-preview) "' + cssText(text.badgePost) + '"'
        rule(RAIL + '>[role="tooltip"]', 'right:' + (frameWidth(config) - 6) + 'px;width:min(' + config.cardWidth
          + 'px,calc(100cqw - 120px));max-height:var(--turn-preview-height);padding:24px 12px 10px;'
          + 'border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background-color:var(--dsw-alias-bg-overlay);'
          + 'background-image:linear-gradient(to bottom,var(--dsw-alias-brand-primary),transparent);'
          + 'background-repeat:no-repeat;background-size:2px calc(100% - 24px);background-position:left 10px;'
          + 'box-shadow:var(--dsw-elevation-panel);backdrop-filter:blur(14px) saturate(1.15)')
        rule(RAIL + '>[role="tooltip"] [class*="_previewPrompt"]',
          '-webkit-line-clamp:' + config.promptLines + ';padding-bottom:6px')
        rule(RAIL + '>[role="tooltip"] [class*="_previewResponse"]',
          'margin-top:6px;padding-top:6px;border-top:1px solid var(--dsw-alias-border-l1)')
        parts.push('@supports (counter-reset:dsh-rail-preview calc(1px / 1px)){'
          + RAIL + '>[role="tooltip"]{counter-reset:dsh-rail-preview calc(var(--turn-natural-position) / 10px + 1)}'
          + RAIL + '>[role="tooltip"]::before{content:' + badge + ';position:absolute;top:8px;left:12px;'
          + 'font-size:10px;line-height:1;letter-spacing:.04em;color:' + mix('label-primary', 58) + ';white-space:nowrap}}')
        if (config.unloadedBadge) {
          var badgeUnloaded = '"' + cssText(text.badgePre) + '" counter(dsh-rail-preview) "'
            + cssText(text.badgeUnloadedPost) + '"'
          parts.push('@supports selector(:has(*)){'
            + RAIL + ':has([class*="_markPreview"][class*="_markUnloaded"])>[role="tooltip"]::before{content:'
            + badgeUnloaded + '}}')
        }
      }

      parts.push('@media (prefers-reduced-motion:reduce){' + RAIL + '::before,' + TICK + '::before,'
        + TICK + '::after{transition:none}' + TICK + '[class*="_markBusy"]::before{animation:none}}')
      return parts.join('')
    }

    /**
     * Page chrome plus the preview stage's replica of the SHIPPED rail look.
     * The replica is styled through single-class selectors so the enhancement
     * rules — which use attribute selectors — keep winning the cascade.
     * @returns {string} the always-present page stylesheet.
     */
    function pageCss() {
      return [
        '.dshtr-page{display:flex;flex-direction:column;gap:14px;max-width:760px;color:var(--dsw-alias-label-primary)}',
        '.dshtr-h1{margin:0;font-size:18px;font-weight:600}',
        '.dshtr-intro{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-tertiary)}',
        '.dshtr-card{display:flex;flex-direction:column;gap:10px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l1);'
        + 'border-radius:12px;background:var(--dsw-alias-bg-layer-1)}',
        '.dshtr-cardHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px}',
        '.dshtr-cardTitle{font-size:13px;font-weight:600}',
        '.dshtr-hint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}',

        '.dshtr-stage{position:relative;height:180px;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);'
        + 'border-radius:12px;background:var(--dsw-alias-bg-layer-2);container-type:inline-size}',
        '.dshtr-stageLabel{position:absolute;left:12px;bottom:10px;font-size:11px;color:var(--dsw-alias-label-caption)}',
        '.dshtr-mockFrame{position:absolute;top:50%;right:18px;width:28px;height:var(--turn-natural-height);'
        + 'transform:translateY(-50%);cursor:pointer}',
        '.dshtr-mockScroller{position:absolute;inset:0}',
        '.dshtr-mockMarks{position:relative;width:100%;height:var(--turn-natural-height)}',
        '.dshtr-mockPos{position:absolute;left:0;right:0;height:10px;transform:translateY(-50%);'
        + 'top:calc(var(--turn-natural-position) + var(--turn-rail-inset))}',
        '.dshtr-mockTick{position:absolute;inset:0 0 0 auto;width:20px;padding:0;border:0;border-radius:8px;'
        + 'background:none;pointer-events:none}',
        '.dshtr-mockTick::before{content:"";position:absolute;top:50%;right:0;width:12px;height:2px;border-radius:2px;'
        + 'background:var(--dsw-alias-border-l4);transform:translateY(-50%);transition:width .14s ease,background-color .14s ease}',
        '.dshtr-mockTick.dshtr-unloaded::before{width:8px;opacity:.6}',
        '.dshtr-mockTick.dshtr-preview::before{width:18px;background:var(--dsw-alias-label-tertiary)}',
        '.dshtr-mockTick.dshtr-active::before{width:20px;background:var(--dsw-alias-label-primary)}',
        '.dshtr-mockCard{position:absolute;top:50%;right:calc(100% + 10px);box-sizing:border-box;'
        + 'width:min(300px,calc(100cqw - 120px));max-height:100px;overflow:hidden;padding:10px 12px;border-radius:10px;'
        + 'background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);'
        + 'transform:translateY(-50%)}',
        '.dshtr-mockPrompt{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden;'
        + 'font-size:13px;font-weight:600;line-height:20px}',
        '.dshtr-mockResponse{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;'
        + 'margin-top:4px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-caption)}',

        '.dshtr-presets{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}',
        '.dshtr-preset{display:flex;flex-direction:column;gap:2px;padding:9px 11px;border:1px solid var(--dsw-alias-border-l1);'
        + 'border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font:inherit;'
        + 'text-align:left;cursor:pointer;transition:border-color 140ms ease,color 140ms ease,background-color 140ms ease}',
        '.dshtr-preset:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}',
        '.dshtr-preset[aria-pressed="true"]{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-brand-primary);'
        + 'background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,var(--dsw-alias-bg-layer-2))}',
        '.dshtr-presetName{font-size:13px;font-weight:600;line-height:20px}',
        '.dshtr-presetHint{font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary)}',
        '.dshtr-preset:focus-visible,.dshtr-switch:focus-visible,.dshtr-reset:focus-visible,'
        + '.dshtr-slider input:focus-visible{outline:1px solid var(--dsw-alias-state-business-primary);outline-offset:2px}',

        '.dshtr-rows{display:flex;flex-direction:column}',
        '.dshtr-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:9px 0;'
        + 'border-top:1px solid var(--dsw-alias-border-l1)}',
        '.dshtr-row:first-child{border-top:0;padding-top:2px}',
        '.dshtr-rowText{min-width:0}',
        '.dshtr-rowLabel{font-size:12.5px;line-height:18px}',
        '.dshtr-rowHint{font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary)}',
        '.dshtr-rowControl{display:flex;flex:none;align-items:center;gap:10px}',
        '.dshtr-switch{position:relative;flex:none;width:34px;height:20px;padding:0;border:1px solid var(--dsw-alias-border-l2);'
        + 'border-radius:999px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;transition:background-color 140ms ease}',
        '.dshtr-switch i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;'
        + 'background:var(--dsw-alias-label-tertiary);transition:left 140ms ease,background-color 140ms ease}',
        '.dshtr-switch[aria-checked="true"]{border-color:transparent;background:var(--dsw-alias-brand-primary)}',
        '.dshtr-switch[aria-checked="true"] i{left:16px;background:#fff}',
        '.dshtr-switch[disabled]{opacity:.45;cursor:not-allowed}',
        '.dshtr-slider{display:flex;align-items:center;gap:10px;min-width:200px}',
        '.dshtr-slider input{flex:1;min-width:110px;accent-color:var(--dsw-alias-brand-primary)}',
        '.dshtr-value{min-width:52px;text-align:right;font-size:12px;font-variant-numeric:tabular-nums;'
        + 'color:var(--dsw-alias-label-secondary)}',
        '.dshtr-actions{display:flex;justify-content:flex-end}',
        '.dshtr-reset{padding:6px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;'
        + 'color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}',
        '.dshtr-reset:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-brand-primary)}',
      ].join('')
    }


    /** Width of the rail's interaction column: the hover target plus usage digits. */
    function frameWidth(config) {
      return config.hitWidth + (config.usage ? 40 : 0)
    }

    /** Compact token count, mirroring the transcript's own usage pill. */
    function formatTokens(value) {
      if (typeof value !== 'number' || !isFinite(value) || value < 0) return null
      function scaled(candidate) {
        return candidate >= 100 ? String(Math.round(candidate)) : String(Math.round(candidate * 10) / 10)
      }
      if (value < 1000) return String(value)
      if (value < 1000000) return scaled(value / 1000) + 'K'
      return scaled(value / 1000000) + 'M'
    }

    /**
     * Read the displayed session's per-turn token usage from the Chat target.
     * Every step is optional: without the services, the session, or the turn
     * data the feature simply contributes no rules.
     * @param {object} ctx - the client plugin context.
     * @returns {{byTurn: object, target: object}|null} usage by turn number, plus the target to subscribe.
     */
    function readUsage(ctx) {
      try {
        var sessions = ctx.get('sessions')
        var conversation = ctx.get('uiConversation')
        if (sessions === undefined || conversation === undefined) return null
        if (sessions.list === undefined || typeof sessions.binding !== 'function') return null
        var current = sessions.list.getSnapshot().current
        if (current === undefined || current === null) return null
        var binding = sessions.binding(current)
        if (binding === undefined) return null
        var target = conversation.binding(binding).target('chat')
        var snapshot = target.getSnapshot()
        var turns = snapshot && snapshot.timeline ? snapshot.timeline.turns : null
        if (!turns || typeof turns.forEach !== 'function') return null
        var byTurn = {}
        turns.forEach(function (record, turn) {
          var store = record ? record.data : null
          var tail = store && typeof store.get === 'function' ? store.get('turn-tail') : undefined
          var usage = tail ? tail.tokenUsage : undefined
          if (usage && typeof usage.totalTokens === 'number') byTurn[turn] = usage
        })
        return { byTurn: byTurn, target: target }
      } catch (error) {
        return null
      }
    }

    /** Turn number of every painted rail mark, in ladder order. */
    function readMarkTurns() {
      var marks = document.querySelectorAll(RAIL + ' [class*="_markPosition"] > button')
      var turns = []
      for (var i = 0; i < marks.length; i++) {
        var match = /(\d+)/.exec(marks[i].getAttribute('aria-label') || '')
        turns.push(match === null ? null : Number(match[1]))
      }
      return turns
    }

    /** Detail line copy: input / output / cache hit. */
    function detailText(text, usage) {
      var input = formatTokens(usage.uncachedInputTokens)
      var output = formatTokens(usage.outputTokens)
      var cache = usage.cacheReadTokens === undefined ? null : formatTokens(usage.cacheReadTokens)
      var out = cssText('\u2191') + (input === null ? '\u2014' : input) + cssText(' \u2193')
        + (output === null ? '\u2014' : output)
      if (cache !== null) out += cssText(' \u00b7 ' + text.usageCache + ' ') + cache
      return out
    }

    /**
     * Rules for one mark: its usage on the rail label, its preview-card badge,
     * the card's detail line, and the optional usage heat band.
     * @param {object} text - page strings.
     * @param {string} anchor - rail selector the rules hang off.
     * @param {number} index - 1-based mark position.
     * @param {number} turn - turn number the mark addresses.
     * @param {object|null} usage - the turn's usage buckets, null for the stage demo.
     * @param {number} total - token total driving the heat scale.
     * @param {number} max - largest total in the same ladder.
     * @param {object} config - normalized field values.
     * @returns {string[]} the rules for this mark.
     */
    function usageRules(text, anchor, index, turn, usage, total, max, config) {
      var compact = formatTokens(total)
      if (compact === null) return []
      var pos = anchor + ' [class*="_markPosition"]:nth-child(' + index + ')'
      var tick = pos + '>button'
      var out = []
      var content = config.ordinals
        ? 'counter(dsh-rail-turn) "' + cssText(' \u00b7 ') + compact + '"'
        : '"' + compact + '"'
      out.push(tick + '[class*="_markActive"]::after,' + tick + '[class*="_markPreview"]::after,'
        + tick + ':focus-visible::after{content:' + content + ';position:absolute;top:50%;right:30px;'
        + 'transform:translateY(-50%);font-size:10px;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:.02em;'
        + 'color:color-mix(in srgb,var(--dsw-alias-label-primary) 46%,transparent);opacity:1;'
        + 'transition:opacity 150ms ease;pointer-events:none;white-space:nowrap}')
      // The :has() argument is relative to the anchor, so it carries the mark
      // part alone — reusing the full anchored selector there never matches.
      var within = ' [class*="_markPosition"]:nth-child(' + index + ')>button[class*="_markPreview"]'
      var hovered = anchor + ':has(' + within + ')>[role="tooltip"]'
      var badge = cssText(text.badgePre) + turn + cssText(text.badgePost) + cssText(' \u00b7 ')
        + compact + cssText(text.usageUnit)
      out.push('@supports selector(:has(*)){' + hovered + '::before{content:"' + badge + '"}}')
      if (config.usageDetail && usage !== null) {
        out.push('@supports selector(:has(*)){' + hovered + '::after{content:"' + detailText(text, usage)
          + '";position:absolute;left:12px;bottom:9px;font-size:10px;line-height:1;letter-spacing:.02em;'
          + 'color:color-mix(in srgb,var(--dsw-alias-label-primary) 52%,transparent);white-space:nowrap}}')
      }
      if (config.usageHeat) {
        var ratio = max > 0 ? total / max : 0
        out.push(pos + '::before{content:"";position:absolute;right:0;top:50%;height:3px;width:'
          + Math.round(10 + 30 * ratio) + 'px;border-radius:2px;transform:translateY(-50%);pointer-events:none;'
          + 'background:color-mix(in srgb,var(--dsw-alias-brand-primary) ' + Math.round(16 + 44 * ratio) + '%,transparent)}')
      }
      return out
    }

    /**
     * Per-turn usage rules. Turn-specific data cannot ride an attribute the
     * product renders, so every rule names the nth-child position of its mark;
     * the real rail excludes the settings stage by its marker class, and the
     * stage gets the same rules over a demo curve.
     * @param {object} config - normalized field values.
     * @param {string} lang - 'zh' or anything else for English.
     * @param {number[]} markTurns - turn per painted mark, ladder order.
     * @param {object|null} usage - per-turn usage of the displayed session.
     * @returns {string} the generated rules, empty while the feature is off.
     */
    function usageCss(config, lang, markTurns, usage) {
      if (!config.enabled || !config.usage) return ''
      var text = strings(lang)
      var live = RAIL + ':not(.dshtr-mockFrame)'
      var parts = []
      if (config.cardUpgrade && config.usageDetail) {
        parts.push(RAIL + '>[role="tooltip"]{padding-bottom:26px}')
      }
      var rows = []
      var max = 0
      if (usage !== null) {
        for (var i = 0; i < markTurns.length && i < USAGE_RULE_LIMIT; i++) {
          var turn = markTurns[i]
          var entry = turn === null ? undefined : usage.byTurn[turn]
          if (entry === undefined) continue
          rows.push({ index: i + 1, turn: turn, usage: entry })
          if (entry.totalTokens > max) max = entry.totalTokens
        }
      }
      for (var r = 0; r < rows.length; r++) {
        parts = parts.concat(usageRules(text, live, rows[r].index, rows[r].turn, rows[r].usage, rows[r].usage.totalTokens, max, config))
      }
      var stageMax = STAGE_USAGE[STAGE_USAGE.length - 1]
      for (var d = 0; d < STAGE_USAGE.length; d++) {
        var demoTotal = STAGE_USAGE[d]
        var demoInput = Math.round(demoTotal * 0.005)
        var demoOutput = Math.round(demoTotal * 0.003)
        var demo = {
          uncachedInputTokens: demoInput,
          outputTokens: demoOutput,
          cacheReadTokens: demoTotal - demoInput - demoOutput,
          totalTokens: demoTotal,
        }
        parts = parts.concat(usageRules(text, '.dshtr-stage ' + RAIL, d + 1, d + 1, demo, demoTotal, stageMax, config))
      }
      return parts.join('')
    }

    /**
     * Mount the rail stylesheet and the Settings → Turn rail page.
     * @param {object} ctx - the client plugin context.
     */
    function apply(ctx) {
      const el = React.createElement
      var config = normalize(undefined)
      var listeners = []
      var tag = null
      var lastMarks = []
      var lastUsage = null
      var lastSignature = ''
      var subscribedTarget = null
      var targetOff = null
      var railObserver = null
      var observedRail = null
      var pendingRefresh = null

      // The namespace may still be unserved on first paint; the defaults stand
      // until the first accepted snapshot, and every later change is adopted.
      var scope = ctx.settingsScope.bind({ namespace: NS })

      function lang() {
        return String(ctx.locale.getLocale().active).indexOf('zh') === 0 ? 'zh' : 'en'
      }

      function paint() {
        if (tag !== null) tag.remove()
        tag = document.createElement('style')
        tag.setAttribute('data-dsh-turn-rail', 'css')
        tag.textContent = pageCss() + railCss(config, lang()) + usageCss(config, lang(), lastMarks, lastUsage)
        document.head.appendChild(tag)
      }

      /** Identity of the per-turn facts the generated rules depend on. */
      function signatureOf(marks, usage) {
        var totals = []
        if (usage !== null) {
          for (var turn in usage.byTurn) {
            if (Object.prototype.hasOwnProperty.call(usage.byTurn, turn)) {
              totals.push(turn + ':' + usage.byTurn[turn].totalTokens)
            }
          }
        }
        return marks.join(',') + '|' + totals.sort().join(',')
      }

      /** Re-read the rail's marks and the session's usage, repainting on change. */
      function refreshUsage() {
        var marks = readMarkTurns()
        var usage = readUsage(ctx)
        var signature = signatureOf(marks, usage)
        var changed = signature !== lastSignature
        lastSignature = signature
        lastMarks = marks
        lastUsage = usage
        if (changed) paint()
        observeRail()
        followTarget(usage)
      }

      /** Coalesce the flood of stream/completion notifications into one pass. */
      function scheduleRefresh() {
        if (pendingRefresh !== null) return
        pendingRefresh = ctx.timeout(function () {
          pendingRefresh = null
          refreshUsage()
        }, 350)
      }

      /** Follow the displayed session's Chat target, one subscription per session. */
      function followTarget(usage) {
        if (usage === null || typeof usage.target.subscribe !== 'function') return
        if (subscribedTarget === usage.target) return
        if (targetOff !== null) targetOff()
        subscribedTarget = usage.target
        targetOff = usage.target.subscribe(scheduleRefresh)
      }

      /** Watch the rail itself: paging history in or out changes its marks. */
      function observeRail() {
        var rail = document.querySelector(RAIL)
        if (rail === null || rail === observedRail) return
        if (railObserver !== null) railObserver.disconnect()
        observedRail = rail
        railObserver = new MutationObserver(scheduleRefresh)
        railObserver.observe(rail, { childList: true, subtree: true })
      }

      function notify() {
        for (var i = 0; i < listeners.length; i++) listeners[i]()
      }

      /** Whether the rendering fields (everything but the preset marker) match. */
      function sameFields(next) {
        for (var key in DEFAULTS) {
          if (key === 'variant') continue
          if (config[key] !== next[key]) return false
        }
        return true
      }

      function adopt() {
        var next = normalize(scope.getSnapshot().value)
        if (sameFields(next) && next.variant === config.variant) return
        var repaint = !sameFields(next)
        config = next
        if (repaint) paint()
        notify()
      }

      /** Write field operations, painting the intent before the durable round-trip. */
      function commit(ops, optimistic) {
        for (var key in optimistic) config[key] = optimistic[key]
        paint()
        notify()
        // The mirror publishes the settled section through the subscription, so
        // adopting here would race it and stamp the pre-write value back.
        scope.mutate(ops).then(function () {}, function () { adopt() })
      }

      function applyPreset(id) {
        var fields = PRESETS[id]
        var ops = [{ op: 'set', path: ['variant'], value: id }]
        var optimistic = { variant: id }
        for (var key in fields) {
          ops.push({ op: 'set', path: [key], value: fields[key] })
          optimistic[key] = fields[key]
        }
        commit(ops, optimistic)
      }

      /**
       * One hand-edited field. The preset highlight is derived from the field
       * values, so a tuned control needs no marker write of its own.
       */
      function setField(field, value) {
        var optimistic = {}
        optimistic[field] = value
        commit([{ op: 'set', path: [field], value: value }], optimistic)
      }

      /** Slider drag: repaint the preview at once, persist on release. */
      function previewField(field, value) {
        config[field] = value
        paint()
        notify()
      }

      function resetAll() {
        var ops = [{ op: 'set', path: ['variant'], value: DEFAULTS.variant }]
        var optimistic = { variant: DEFAULTS.variant }
        for (var key in DEFAULTS) {
          if (key === 'variant') continue
          ops.push({ op: 'set', path: [key], value: DEFAULTS[key] })
          optimistic[key] = DEFAULTS[key]
        }
        commit(ops, optimistic)
      }

      function useConfig() {
        var bump = React.useState(0)[1]
        React.useEffect(function () {
          var listener = function () { bump(function (n) { return n + 1 }) }
          listeners.push(listener)
          return function () {
            var index = listeners.indexOf(listener)
            if (index >= 0) listeners.splice(index, 1)
          }
        }, [])
        return config
      }

      /** String key carrying one field's label. */
      function labelKey(field) {
        return 'option' + field.charAt(0).toUpperCase() + field.slice(1)
      }

      /** One labelled switch bound to a boolean field. */
      function switchRow(text, values, field, hint, disabled) {
        return el('div', { className: 'dshtr-row', key: field },
          el('div', { className: 'dshtr-rowText' },
            el('div', { className: 'dshtr-rowLabel' }, text[labelKey(field)]),
            hint === undefined || hint === '' ? null : el('div', { className: 'dshtr-rowHint' }, hint)),
          el('button', {
            type: 'button',
            className: 'dshtr-switch',
            role: 'switch',
            'aria-checked': values[field] ? 'true' : 'false',
            'aria-label': text[labelKey(field)],
            disabled: disabled === true,
            onClick: function () { if (disabled !== true) setField(field, !values[field]) },
          }, el('i', null)))
      }

      /** One labelled range bound to a numeric field. */
      function sliderRow(text, values, field, unit) {
        var range = RANGES[field]
        var disabled = (field === 'spineWidth' && !values.spine)
          || (CARD_FIELDS.indexOf(field) >= 0 && !values.cardUpgrade)
        return el('div', { className: 'dshtr-row', key: field },
          el('div', { className: 'dshtr-rowText' },
            el('div', { className: 'dshtr-rowLabel' }, text[labelKey(field)])),
          el('div', { className: 'dshtr-rowControl dshtr-slider' },
            el('input', {
              type: 'range',
              min: range[0],
              max: range[1],
              step: 1,
              value: values[field],
              disabled: disabled,
              'aria-label': text[labelKey(field)],
              onInput: function (event) { previewField(field, Number(event.target.value)) },
              onChange: function (event) { setField(field, Number(event.target.value)) },
            }),
            el('span', { className: 'dshtr-value' }, String(values[field]) + unit)))
      }

      /** The mock rail, styled by the very stylesheet the real rail uses. */
      function previewStage(text) {
        var count = 9
        var marks = []
        for (var i = 0; i < count; i++) {
          var state = i === 2 ? 'preview' : (i === count - 1 ? 'active' : 'unloaded')
          marks.push(el('div', {
            key: i,
            className: '_markPosition dshtr-mockPos',
            style: { '--turn-natural-position': (i * 10) + 'px' },
          }, el('button', {
            type: 'button',
            tabIndex: -1,
            className: '_mark _mark' + state.charAt(0).toUpperCase() + state.slice(1)
              + ' dshtr-mockTick dshtr-' + state,
          })))
        }
        return el('div', { className: 'dshtr-card' },
          el('div', { className: 'dshtr-cardHead' },
            el('span', { className: 'dshtr-cardTitle' }, text.previewTitle),
            el('span', { className: 'dshtr-hint' }, text.previewHint)),
          el('div', { className: 'dshtr-stage', 'aria-hidden': 'true' },
            el('span', { className: 'dshtr-stageLabel' }, text.stageHint),
            el('nav', {
              className: '_frame dshtr-mockFrame',
              style: {
                '--turn-natural-height': ((count - 1) * 10 + 12) + 'px',
                '--turn-rail-inset': '6px',
                '--turn-scroll-top': '0px',
              },
            },
            el('div', { className: 'dshtr-mockScroller' },
              el('div', { className: '_marks dshtr-mockMarks' }, marks)),
            el('div', {
              className: '_preview dshtr-mockCard',
              role: 'tooltip',
              style: { '--turn-natural-position': '20px' },
            },
            el('div', { className: '_previewPrompt dshtr-mockPrompt' }, text.samplePrompt),
            el('div', { className: '_previewResponse dshtr-mockResponse' }, text.sampleResponse)))))
      }

      function SettingsSection() {
        var values = useConfig()
        var text = strings(lang())
        var active = presetOf(values)
        var rows = [
          switchRow(text, values, 'enabled'),
          switchRow(text, values, 'spine', text.hintSpine),
          sliderRow(text, values, 'spineWidth', text.unitPx),
          switchRow(text, values, 'ordinals', text.hintOrdinals),
          switchRow(text, values, 'hoverGrow', text.hintHoverGrow),
          switchRow(text, values, 'halo', text.hintHalo),
          sliderRow(text, values, 'hitWidth', text.unitPx),
          switchRow(text, values, 'cardUpgrade', text.hintCardUpgrade),
          sliderRow(text, values, 'cardWidth', text.unitPx),
          sliderRow(text, values, 'promptLines', text.unitLine),
          switchRow(text, values, 'unloadedBadge', text.hintUnloadedBadge),
          switchRow(text, values, 'usage', text.hintUsage),
          switchRow(text, values, 'usageDetail', text.hintUsageDetail, !values.usage),
          switchRow(text, values, 'usageHeat', text.hintUsageHeat, !values.usage),
        ]
        return el('div', { className: 'dshtr-page' },
          el('h2', { className: 'dshtr-h1' }, text.title),
          el('p', { className: 'dshtr-intro' }, text.desc),
          previewStage(text),
          el('div', { className: 'dshtr-card' },
            el('div', { className: 'dshtr-cardHead' },
              el('span', { className: 'dshtr-cardTitle' }, text.presetsTitle),
              el('span', { className: 'dshtr-hint' }, active === 'custom' ? text.customHint : text.presets[active].hint)),
            el('div', { className: 'dshtr-presets' }, PRESET_IDS.map(function (id) {
              return el('button', {
                key: id,
                type: 'button',
                className: 'dshtr-preset',
                'aria-pressed': active === id ? 'true' : 'false',
                onClick: function () { applyPreset(id) },
              },
              el('span', { className: 'dshtr-presetName' }, text.presets[id].title),
              el('span', { className: 'dshtr-presetHint' }, text.presets[id].hint))
            }))),
          el('div', { className: 'dshtr-card' },
            el('div', { className: 'dshtr-cardHead' },
              el('span', { className: 'dshtr-cardTitle' }, text.controlsTitle),
              el('span', { className: 'dshtr-hint' }, text.controlsHint)),
            el('div', { className: 'dshtr-rows' }, rows)),
          el('div', { className: 'dshtr-actions' },
            el('button', { type: 'button', className: 'dshtr-reset', onClick: resetAll }, text.reset)))
      }


      ctx.effect(function () {
        paint()
        return function () {
          listeners = []
          if (tag !== null) { tag.remove(); tag = null }
        }
      }, 'turn-rail: css')
      ctx.effect(function () { return scope.subscribe(adopt) }, 'turn-rail: settings')
      ctx.effect(function () {
        var sessions = ctx.get('sessions')
        var offList = sessions !== undefined && sessions.list !== undefined
          ? sessions.list.subscribe(scheduleRefresh)
          : function () {}
        // The rail can mount long after apply (a restored session, paged history)
        // without any store notifying, so the marks are also polled slowly.
        var offPoll = ctx.interval(scheduleRefresh, 2000)
        refreshUsage()
        observeRail()
        return function () {
          offList()
          offPoll()
          if (pendingRefresh !== null) { pendingRefresh(); pendingRefresh = null }
          if (railObserver !== null) { railObserver.disconnect(); railObserver = null }
          if (targetOff !== null) { targetOff(); targetOff = null }
          observedRail = null
          subscribedTarget = null
          lastMarks = []
          lastUsage = null
          lastSignature = ''
        }
      }, 'turn-rail: usage data')
      adopt()

      if (ctx.slots === undefined) {
        console.error('turn-rail: slots service unavailable')
        return
      }
      ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'turn-rail',
        order: 22,
        label: () => strings(lang()).sectionLabel,
      }, SettingsSection))
    }

    module.exports = { name: name, inject: inject, apply: apply };
    return module.exports;
  }
});
