/** Typed locale dictionaries for the liquid glass settings page. */

export type LiquidGlassLocaleKey =
  | 'nav'
  | 'page.title'
  | 'page.intro'
  | 'enable.title'
  | 'enable.description'
  | 'enable.on'
  | 'enable.off'
  | 'seaTheme.title'
  | 'seaTheme.dark'
  | 'seaTheme.light'
  | 'colorMode.title'
  | 'colorMode.theme'
  | 'colorMode.custom'
  | 'colorMode.hint'
  | 'colorA.title'
  | 'colorB.title'
  | 'color.random'
  | 'digit.title'
  | 'digit.size'
  | 'digit.brightness'
  | 'digit.flicker'
  | 'digit.foam'
  | 'digit.foamAmount'
  | 'style.title'
  | 'style.zeabur.dark'
  | 'style.zeabur.light'
  | 'style.ghibli.day'
  | 'style.ghibli.dusk'
  | 'speed.title'
  | 'colorWave.title'
  | 'opacity.title'
  | 'blur.title'
  | 'blur.hint'
  | 'pixel.title'
  | 'pixel.hint'
  | 'pixel.size'
  | 'pixel.posterize'
  | 'pixel.charset'
  | 'layers.title'
  | 'layers.grid'
  | 'layers.digits'
  | 'layers.gradient'
  | 'layers.rays'
  | 'layers.wave'
  | 'reset.title'
  | 'zeabur.only'
  | 'style.ghibliNote'
  | 'speed.title.short'
  | 'opacity.title.short'
  | 'blur.title.short'

export const en: Record<LiquidGlassLocaleKey, string> = {
  nav: 'Liquid Glass',
  'page.title': 'Liquid Glass',
  'page.intro': 'Translucent frosted surfaces with backdrop blur over a live sea background. Changes apply immediately.',
  'enable.title': 'Enable liquid glass',
  'enable.description': 'Glass panes, wallpaper, and blur effects across the whole interface.',
  'enable.on': 'On',
  'enable.off': 'Off',
  'seaTheme.title': 'Sea palette',
  'seaTheme.dark': 'Dark violet',
  'seaTheme.light': 'Warm orange',
  'colorMode.title': 'Band colors',
  'colorMode.theme': 'Theme palette',
  'colorMode.custom': 'Custom',
  'colorMode.hint': 'Custom feeds your two colors to the flowing bands; Random rolls a fresh harmonious pair.',
  'colorA.title': 'Deep band',
  'colorB.title': 'Bright band',
  'color.random': 'Random colors',
  'digit.title': 'Digital sea',
  'digit.size': 'Digit size',
  'digit.brightness': 'Digit brightness',
  'digit.flicker': 'Flicker speed',
  'digit.foam': 'Character foam',
  'digit.foamAmount': 'Foam amount',
  'style.title': 'Sea style',
  'style.zeabur.dark': 'Data sea · dark',
  'style.zeabur.light': 'Data sea · warm',
  'style.ghibli.day': 'Ghibli · day',
  'style.ghibli.dusk': 'Ghibli · dusk',
  'speed.title': 'Band flow speed',
  'colorWave.title': 'Color wave',
  'opacity.title': 'Wallpaper opacity',
  'blur.title': 'Glass blur strength',
  'blur.hint': 'Applies to the sidebar, dialogs, overlays, and cards.',
  'pixel.title': 'Pixelate overlay',
  'pixel.hint': 'Stacks a blocky pixel grid on any sea style; 0 posterize keeps smooth colors.',
  'pixel.size': 'Block size',
  'pixel.posterize': 'Posterize levels (0 = off)',
  'pixel.charset': 'Glyph charset',
  'layers.title': 'Sea layers',
  'layers.grid': 'Grid',
  'layers.digits': 'Digit rain',
  'layers.gradient': 'Color bands',
  'layers.rays': 'God rays',
  'layers.wave': 'Wave line',
  'reset.title': 'Reset to defaults',
  'zeabur.only': 'Applies to the data sea styles only',
  'style.ghibliNote': 'Ghibli styles render a pure hand-painted sea — band colors, the digital sea, and layer switches apply to the data sea styles only.',
  'speed.title.short': 'Flow speed',
  'opacity.title.short': 'Opacity',
  'blur.title.short': 'Blur',
}

export const zh: Record<LiquidGlassLocaleKey, string> = {
  nav: '液态玻璃',
  'page.title': '液态玻璃',
  'page.intro': '半透明磨砂表面与背景模糊,铺在流动的海面背景上,修改立即生效。',
  'enable.title': '启用液态玻璃',
  'enable.description': '全局玻璃面板、壁纸与模糊效果。',
  'enable.on': '开',
  'enable.off': '关',
  'seaTheme.title': '海面配色',
  'seaTheme.dark': '暗紫',
  'seaTheme.light': '暖橙',
  'colorMode.title': '色带配色',
  'colorMode.theme': '主题配色',
  'colorMode.custom': '自定义',
  'colorMode.hint': '自定义时海面色带使用你选的两个颜色；随机按钮会掷出一组和谐的新配色。',
  'colorA.title': '深色带',
  'colorB.title': '亮色带',
  'color.random': '随机配色',
  'digit.title': '数字海',
  'digit.size': '字符大小',
  'digit.brightness': '字符亮度',
  'digit.flicker': '闪烁速度',
  'digit.foam': '字符泡沫',
  'digit.foamAmount': '泡沫浓度',
  'style.title': '海面风格',
  'style.zeabur.dark': '数据海·暗紫',
  'style.zeabur.light': '数据海·暖橙',
  'style.ghibli.day': '吉卜力·白日',
  'style.ghibli.dusk': '吉卜力·黄昏',
  'speed.title': '色带流速',
  'colorWave.title': '色彩波动',
  'opacity.title': '壁纸不透明度',
  'blur.title': '玻璃模糊强度',
  'blur.hint': '作用于侧栏、对话框、浮层与卡片。',
  'pixel.title': '像素化叠加',
  'pixel.hint': '在任意海面风格上叠加像素块网格，可与吉卜力等风格自由组合；色阶为 0 时保留平滑颜色。',
  'pixel.size': '像素块大小',
  'pixel.posterize': '色阶量化（0 = 关）',
  'pixel.charset': '字符集',
  'layers.title': '海面图层',
  'layers.grid': '网格',
  'layers.digits': '字符海',
  'layers.gradient': '色带',
  'layers.rays': '光柱',
  'layers.wave': '波峰线',
  'reset.title': '恢复默认',
  'zeabur.only': '仅数据海风格生效',
  'style.ghibliNote': '吉卜力风格是纯手绘海面；下方色带配色、数字海与图层开关仅作用于数据海风格。',
  'speed.title.short': '色带流速',
  'opacity.title.short': '不透明度',
  'blur.title.short': '玻璃模糊',
}
