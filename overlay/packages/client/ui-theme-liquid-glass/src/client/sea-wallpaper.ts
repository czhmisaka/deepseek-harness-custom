/**
 * Sea wallpaper: mounts the bundled @xietuier/matrix-rain sea background
 * (flowing color bands, dark palette) as the fixed bottom layer while the
 * Liquid Glass theme is active, and destroys it on any other theme.
 *
 * The IIFE is imported as a string and injected through a script tag so the
 * global is defined exactly once per page.
 */
import seaBackgroundScript from './sea-background-script.ts'
import type { SeaTheme } from '../liquid-glass-settings.ts'

const WALLPAPER_SELECTOR = '[data-dsg-sea-wallpaper]'

/** Whether the sea script has already been injected on this page. */
let scriptInjected = false

/** The mounted background handle (create + destroy + live setters). */
interface SeaInstance {
  canvas: HTMLCanvasElement
  destroy: () => void
  setTheme?: (theme: string) => void
  setSpeed?: (speed: number) => void
  setColors?: (colorA: readonly number[] | undefined, colorB: readonly number[] | undefined) => void
  clearColors?: () => void
  setEffects?: (e: { cols?: number; bright?: number; flicker?: number; foamAmount?: number; foamGlyph?: number; pixel?: number; post?: number }) => void
  setStyle?: (style: 'zeabur' | 'ghibli') => void
  setPlacement?: (x: number, y: number, w: number, h: number) => void
  setCharset?: (chars: string) => void
  setColorWave?: (on: boolean) => void
  setOpacity?: (n: number) => void
  setLayers?: (partial: { grid?: boolean; ascii?: boolean; gradient?: boolean; rays?: boolean; wave?: boolean; foam?: boolean }) => void
}

let instance: SeaInstance | undefined

/** One wallpaper parameter set: palette, flow speed, and the effect dials. */
export interface SeaWallpaperParams {
  seaTheme: SeaTheme
  speed: number
  /** Custom deep band color (#rrggbb); undefined keeps the theme preset. */
  colorA?: string
  /** Custom bright band color (#rrggbb); undefined keeps the theme preset. */
  colorB?: string
  /** Digit layer grid density multiplier; larger means larger digits. */
  digitSize?: number
  /** Digit layer alpha, 0-1. */
  digitBrightness?: number
  /** Digit flicker speed multiplier. */
  digitFlicker?: number
  /** Whether the character-spray foam layer renders. */
  foam?: boolean
  /** Foam intensity multiplier, 0-1.5. */
  foamAmount?: number
  /** Sea style: data sea (zeabur) or ghibli anime waves. */
  seaStyle?: 'zeabur' | 'ghibli'
  /** Pixelate overlay: snap the whole sea to a block grid. */
  pixel?: boolean
  /** Pixel block size in ocean css px (the 1080-normalized space), 4-48. */
  pixelSize?: number
  /** Posterize levels over the sea colors; 0 keeps smooth gradients. */
  pixelPosterize?: number
  /** Glyph charset for the digit/foam atlas (up to 64 visible chars). */
  charset?: string
  /** Wallpaper opacity, 0-1. */
  opacity?: number
  /** Tide trough/peak hue oscillation. */
  colorWave?: boolean
  /** Layer switches (zeabur bitmask; ghibli renders the grid bit only — digit rain removed). */
  layerGrid?: boolean
  layerDigits?: boolean
  layerGradient?: boolean
  layerRays?: boolean
  layerWave?: boolean
}

/** The sea global the injected IIFE defines. */
interface SeaGlobal {
  MatrixRainSea?: {
    createSeaBackground: (options: Record<string, unknown>) => SeaInstance
  }
}

/**
 * Screen-anchored ocean: the sea is one fixed plane pinned to the physical
 * desktop (a 1920x1080 css normalization window). Every browser window
 * renders the slice its viewport covers, so overlapping windows show the
 * identical water at the same screen position - continuity needs no peer
 * exchange, only each window's own screen coordinates.
 */

/** Sea normalization size in css px: the field's scale shared by all windows. */
const SEA_OCEAN_CSS = { w: 1920, h: 1080 } as const

/** Ocean height in css px mapped to cells when pixelation is on. */
const PIXEL_BLOCKS_BASE = 1080

let placementTimer: ReturnType<typeof setInterval> | undefined
let lastPlacement = ''

/** Last charset pushed to the atlas; setCharset re-uploads the texture. */
let lastCharset: string | undefined

/**
 * Pure: this viewport's slice of the screen-anchored sea (device px, GL y-up
 * origin). dpr appears in every term and cancels in the uv ratio, so windows
 * on mixed-density monitors stay continuous.
 * @param viewportLeft - viewport left edge in screen css px.
 * @param viewportBottom - viewport bottom edge in screen css px.
 * @param dpr - this window's device pixel ratio.
 * @returns origin inside the ocean plus the ocean size.
 */
export function computeScreenPlacement(
  viewportLeft: number,
  viewportBottom: number,
  dpr: number,
): { x: number; y: number; w: number; h: number } {
  return {
    x: viewportLeft * dpr,
    y: (SEA_OCEAN_CSS.h - viewportBottom) * dpr,
    w: SEA_OCEAN_CSS.w * dpr,
    h: SEA_OCEAN_CSS.h * dpr,
  }
}

/** Compute and push this window's sea slice; skips the call when nothing moved. */
function applyScreenPlacement(): void {
  if (instance === undefined) return
  // Moving a window fires no event: poll the screen coordinates instead.
  const chromeX = Math.max(0, window.outerWidth - window.innerWidth)
  const chromeY = Math.max(0, window.outerHeight - window.innerHeight)
  const viewportLeft = window.screenX + chromeX
  const viewportBottom = window.screenY + chromeY + window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const place = computeScreenPlacement(viewportLeft, viewportBottom, dpr)
  const key = [place.x, place.y, place.w, place.h].join(',')
  if (key === lastPlacement) return
  lastPlacement = key
  instance.setPlacement?.(place.x, place.y, place.w, place.h)
}

/** Start the placement poll. */
function startPlacementLoop(): void {
  if (placementTimer !== undefined) return
  applyScreenPlacement()
  placementTimer = setInterval(() => { applyScreenPlacement() }, 1000)
}

/** Stop the placement poll. */
function stopPlacementLoop(): void {
  if (placementTimer !== undefined) {
    clearInterval(placementTimer)
    placementTimer = undefined
  }
  lastPlacement = ''
}

/** Parse #rrggbb into the shader's 0-1 rgb triple, or undefined when invalid. */
function hexToRgb(hex: string | undefined): [number, number, number] | undefined {
  if (hex === undefined) return undefined
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
  const digits = match?.[1]
  if (digits === undefined) return undefined
  const value = parseInt(digits, 16)
  return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255]
}

/** Resolve the atlas charset: strip duplicates/controls, cap at 64 glyphs. */
function resolveCharset(chars: string | undefined): string | undefined {
  if (chars === undefined) return undefined
  const unique = Array.from(new Set(chars.replace(/[\u0000-\u001f]/g, '')))
  if (unique.length === 0) return undefined
  return unique.slice(0, 64).join('')
}

/** Compute the layer switches from one parameter set (off unless opted in for rays/wave). */
function resolveLayers(params: SeaWallpaperParams): {
  grid: boolean; ascii: boolean; gradient: boolean; rays: boolean; wave: boolean; foam: boolean
} {
  const resolved = {
    grid: params.layerGrid !== false,
    // Pixel mode retires the text layers: the blocky sea, waves, and glyph-free
    // foam carry the look; the digit rain would fight the block grid.
    ascii: params.layerDigits !== false && params.pixel !== true,
    gradient: params.layerGradient !== false,
    rays: params.layerRays === true,
    wave: params.layerWave === true,
    foam: params.foam !== false,
  }
  console.log('[liquid-glass] resolveLayers:', JSON.stringify(resolved), 'digits:', params.layerDigits, 'foam:', params.foam, 'grid:', params.layerGrid, 'pixel:', params.pixel)
  return resolved
}

/**
 * Mount the sea wallpaper as the bottom layer of the document.
 * Idempotent: repeated calls while mounted are no-ops (see updateSeaWallpaper
 * for live parameter application on an already-mounted wallpaper).
 *
 * @param params - the sea palette, flow speed, and optional custom colors.
 */
export function mountSeaWallpaper(params: SeaWallpaperParams): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(WALLPAPER_SELECTOR) !== null) return

  if (!scriptInjected) {
    const script = document.createElement('script')
    script.textContent = seaBackgroundScript
    document.head.appendChild(script)
    scriptInjected = true
  }

  const layer = document.createElement('div')
  layer.setAttribute('data-dsg-sea-wallpaper', '')
  document.body.prepend(layer)

  const globalApi = (window as unknown as SeaGlobal).MatrixRainSea
  if (globalApi?.createSeaBackground === undefined) return
  const colorA = hexToRgb(params.colorA)
  const colorB = hexToRgb(params.colorB)
  const charset = resolveCharset(params.charset)
  instance = globalApi.createSeaBackground({
    container: layer,
    theme: params.seaTheme,
    speed: params.speed,
    colorWave: params.colorWave !== false,
    opacity: params.opacity ?? 1,
    // Mid-screen wave line and god rays stay opt-in; the rest default on.
    layers: resolveLayers(params),
    ...(charset !== undefined ? { charset } : {}),
    ...(colorA !== undefined ? { colorA } : {}),
    ...(colorB !== undefined ? { colorB } : {}),
  })
  lastCharset = charset
  pushEffectUniforms(params)
  instance.setTheme?.(params.seaTheme)
  instance.setStyle?.(params.seaStyle === 'ghibli' ? 'ghibli' : 'zeabur')
  // Join the screen-anchored ocean: poll own viewport, render own slice.
  startPlacementLoop()
}

/**
 * Update the live sea instance (palette with built-in fade, flow speed, pixel
 * overlay, charset, layer switches, custom band colors). Safe to call on every
 * settings sync; no-op unmounted.
 */
export function updateSeaWallpaper(params: SeaWallpaperParams): void {
  if (instance === undefined) return
  instance.setTheme?.(params.seaTheme)
  instance.setSpeed?.(params.speed)
  const colorA = hexToRgb(params.colorA)
  const colorB = hexToRgb(params.colorB)
  if (colorA !== undefined || colorB !== undefined) {
    instance.setColors?.(colorA, colorB)
  } else {
    instance.clearColors?.()
  }
  instance.setColorWave?.(params.colorWave !== false)
  instance.setOpacity?.(params.opacity ?? 1)
  instance.setLayers?.(resolveLayers(params))
  const charset = resolveCharset(params.charset)
  if (charset !== lastCharset) {
    instance.setCharset?.(charset ?? '')
    lastCharset = charset
  }
  pushEffectUniforms(params)
  instance.setStyle?.(params.seaStyle === 'ghibli' ? 'ghibli' : 'zeabur')
}

/** Push the digit/pixel/foam effect parameters to the live instance. */
function pushEffectUniforms(params: SeaWallpaperParams): void {
  if (instance === undefined) return
  const blockSize = Math.min(48, Math.max(4, params.pixelSize ?? 16))
  instance.setEffects?.({
    // 0.8.x baseline: all three shaders run the digit grid at cols=78; the
    // 56 port made cells 1.4x larger, which read as chunky polka dots on the
    // ghibli dusk sea instead of the intended fine texture.
    cols: 78 / Math.max(0.4, params.digitSize ?? 1),
    bright: params.digitBrightness ?? 0.3,
    flicker: params.digitFlicker ?? 1,
    foamAmount: params.foamAmount ?? 1,
    foamGlyph: params.pixel === true ? 0 : 1,
    pixel: params.pixel === true ? PIXEL_BLOCKS_BASE / blockSize : 0,
    post: Math.min(12, Math.max(0, Math.round(params.pixelPosterize ?? 0))),
  })
}

/** Unmount the sea wallpaper and stop its animation. Idempotent. */
export function unmountSeaWallpaper(): void {
  if (typeof document === 'undefined') return
  stopPlacementLoop()
  document.querySelector(WALLPAPER_SELECTOR)?.remove()
  instance?.destroy()
  instance = undefined
  lastCharset = undefined
}
