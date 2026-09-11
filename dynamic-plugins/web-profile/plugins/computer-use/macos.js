/**
 * macOS execution backend for the computer-use tool. Every system tool is
 * invoked by absolute path so a constrained harness PATH cannot break it:
 * /usr/sbin/screencapture, /usr/bin/osascript, and the optional cliclick
 * binary under its common Homebrew locations. Process spawning is injectable
 * for tests; everything else composes the pure builders from key-script.js.
 * @module dsh-tool-computer-use/macos
 */

import { execFile } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildClickScript, buildKeyScript, buildKeystrokeScript, buildScrollScript } from './key-script.js'

const SCREENCAPTURE = '/usr/sbin/screencapture'
const OSASCRIPT = '/usr/bin/osascript'
/** cliclick candidates: PATH-resolved first, then the two common Homebrew prefixes. */
const CLICLICK_CANDIDATES = ['cliclick', '/opt/homebrew/bin/cliclick', '/usr/local/bin/cliclick']

/** Default per-process timeout; the tool-level timeoutMs bounds the whole call. */
const RUN_TIMEOUT_MS = 20_000

/** Raised when macOS privacy permission (Screen Recording, Accessibility) blocks an operation. */
export class PermissionDeniedError extends Error {}

/** Raised when the active backend cannot perform an action (missing cliclick). */
export class UnsupportedBackendError extends Error {}

/**
 * Translate one captured stderr into a permission failure when it matches a
 * known macOS TCC refusal signature (English and Chinese system locales).
 * @param {string} stderr - the process stderr.
 * @returns {PermissionDeniedError|undefined} the translated error, or undefined.
 */
export function permissionErrorFromStderr(stderr) {
  const text = stderr ?? ''
  if (/-25211|-1719|-10004|not allowed assistive|assistive access|权限违例|辅助功能/iu.test(text)) {
    return new PermissionDeniedError(
      'macOS denied control of the mouse and keyboard: the app that runs dsh lacks the Accessibility permission. '
      + 'Grant it in System Settings → Privacy & Security → Accessibility (add and enable the terminal or app that launches dsh), then restart dsh.',
    )
  }
  if (/could not create image|screen recording|屏幕录制|录屏/iu.test(text)) {
    return new PermissionDeniedError(
      'macOS denied screen capture: the app that runs dsh lacks the Screen Recording permission. '
      + 'Grant it in System Settings → Privacy & Security → Screen Recording (add and enable the terminal or app that launches dsh), then restart dsh.',
    )
  }
  return undefined
}

/**
 * Default process runner: execFile with a bounded timeout, cancellation
 * signal, and a 4 MB output cap. Errors carry stdout/stderr so callers can
 * translate TCC refusals.
 * @param {string} file - absolute or PATH-resolved executable.
 * @param {string[]} args - argv array.
 * @param {{signal?: AbortSignal, timeoutMs?: number}} options - cancellation and timeout.
 * @returns {Promise<{stdout: string, stderr: string}>} the process output.
 */
export function defaultRun(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, {
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
      timeout: options.timeoutMs ?? RUN_TIMEOUT_MS,
      signal: options.signal,
      windowsHide: true,
    }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout
        error.stderr = stderr
        reject(error)
        return
      }
      resolve({ stdout, stderr })
    })
  })
}

/**
 * Create the macOS backend. All methods take the tool execution's AbortSignal
 * and refuse work after cancellation.
 * @param {{run?: typeof defaultRun}} deps - optional process-runner replacement for tests.
 * @returns {object} the backend with screenBounds, cursorPosition, captureScreen,
 *   leftClick, doubleClick, rightClick, move, drag, typeText, pressKey, and scroll.
 */
export function createMacBackend(deps = {}) {
  const run = deps.run ?? defaultRun

  /** Resolved cliclick path: undefined = undetected, null = absent, string = usable. */
  let cliclickPath

  /**
   * Detect cliclick once by asking every candidate for its (harmless) current
   * position; a binary that answers is usable.
   * @param {AbortSignal|undefined} signal - cancellation signal.
   * @returns {Promise<string|null>} the cliclick path, or null when absent.
   */
  async function resolveCliclick(signal) {
    if (cliclickPath !== undefined) return cliclickPath
    for (const candidate of CLICLICK_CANDIDATES) {
      try {
        const { stdout } = await run(candidate, ['p'], { signal, timeoutMs: 5_000 })
        if (/(-?\d+)\D+(-?\d+)/u.test(stdout)) {
          cliclickPath = candidate
          return cliclickPath
        }
      } catch {
        // Absent or broken candidate — try the next one; absence is the normal case.
      }
    }
    cliclickPath = null
    return null
  }

  /**
   * Require cliclick for precision-only mouse actions.
   * @param {AbortSignal|undefined} signal - cancellation signal.
   * @returns {Promise<string>} the resolved cliclick path.
   */
  async function requireCliclick(signal) {
    const path = await resolveCliclick(signal)
    if (path === null) {
      throw new UnsupportedBackendError(
        'this action needs cliclick, which is not installed. Install it with "brew install cliclick" '
        + 'and retry; left_click and keyboard actions work without it.',
      )
    }
    return path
  }

  /** Run osascript in AppleScript mode and translate TCC refusals. */
  async function osascript(script, signal) {
    try {
      return await run(OSASCRIPT, ['-e', script], { signal })
    } catch (error) {
      const permission = permissionErrorFromStderr(error?.stderr ?? error?.message)
      throw permission ?? error
    }
  }

  /** Run osascript in JXA mode (display geometry and cursor position need no TCC permission). */
  async function jxa(script, signal) {
    return run(OSASCRIPT, ['-l', 'JavaScript', '-e', script], { signal })
  }

  return {
    run,

    /**
     * Enumerate the active displays with their global top-left-origin bounds,
     * main display first. Uses NSScreen through JXA (frames need no TCC
     * permission) and converts Cocoa's bottom-left-origin frames into the
     * same global top-left space CoreGraphics and cliclick use; the
     * conversion was cross-checked against CGDisplayBounds.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<Array<{id: number, index: number, isMain: boolean, x: number, y: number, width: number, height: number}>>} the
     *   active displays; index is the 1-based enumeration position.
     */
    async listDisplays(signal) {
      const { stdout } = await jxa(
        'ObjC.import("AppKit");'
        + 'const screens = $.NSScreen.screens;'
        + 'const n = Number(screens.count);'
        + 'const mainH = Number(screens.objectAtIndex(0).frame.size.height);'
        + 'const out = [];'
        + 'for (let i = 0; i < n; i++) {'
        + '  const s = screens.objectAtIndex(i);'
        + '  const f = s.frame;'
        + '  const did = Number(ObjC.unwrap(s.deviceDescription.objectForKey("NSScreenNumber")));'
        + '  out.push({ id: did, index: i + 1, isMain: i === 0,'
        + '    x: Math.round(Number(f.origin.x)),'
        + '    y: Math.round(mainH - Number(f.origin.y) - Number(f.size.height)),'
        + '    width: Math.round(Number(f.size.width)),'
        + '    height: Math.round(Number(f.size.height)) });'
        + '}'
        + 'JSON.stringify(out)',
        signal,
      )
      let parsed
      try {
        parsed = JSON.parse(stdout)
      } catch {
        throw new Error('could not enumerate the active displays; got ' + JSON.stringify(stdout))
      }
      if (!Array.isArray(parsed)) {
        throw new Error('could not enumerate the active displays; got ' + JSON.stringify(stdout))
      }
      // Keep only well-formed records: a malformed id (or a virtual screen)
      // must not poison the capture mapping later.
      return parsed.filter((display) => display !== null && typeof display === 'object'
        && Number.isInteger(display.id) && display.id > 0
        && Number.isFinite(display.width) && display.width > 0
        && Number.isFinite(display.height) && display.height > 0)
    },

    /**
     * Probe the environment capabilities the tool depends on, for the
     * settings-page status row. Screen Recording is probed with a 1x1-point
     * region capture (the image never leaves the machine and is unlinked
     * immediately); Accessibility with the harmless `UI elements enabled`
     * query; cliclick with its position probe.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<{screenRecording: boolean|null, accessibility: boolean|null, cliclick: boolean|null}>} per-capability
     *   state; `null` means the probe could not tell.
     */
    async probeEnvironment(signal) {
      const state = { screenRecording: null, accessibility: null, cliclick: null }
      // Screen Recording: a tiny region capture; a TCC denial surfaces as the
      // translated PermissionDeniedError, any other failure stays unknown.
      const probePath = join(tmpdir(), 'dsh-computer-use-probe-' + process.pid + '.png')
      try {
        await run(SCREENCAPTURE, ['-x', '-t', 'png', '-R0,0,1,1', probePath], { signal, timeoutMs: 5_000 })
        state.screenRecording = true
      } catch (error) {
        if (permissionErrorFromStderr(error?.stderr ?? error?.message) !== undefined) {
          state.screenRecording = false
        }
      } finally {
        await rm(probePath, { force: true }).catch(() => {})
      }
      // Accessibility: the README's own self-check query.
      try {
        const { stdout } = await run(OSASCRIPT, ['-e', 'tell application "System Events" to get UI elements enabled'], { signal, timeoutMs: 5_000 })
        state.accessibility = stdout.trim() === 'true'
      } catch {
        state.accessibility = false
      }
      state.cliclick = (await resolveCliclick(signal)) !== null
      return state
    },

    /**
     * Main display dimensions in points, via CoreGraphics through JXA.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<{width: number, height: number}>} screen size in points.
     */
    async screenBounds(signal) {
      const { stdout } = await jxa(
        'ObjC.import("CoreGraphics"); const b = $.CGDisplayBounds($.CGMainDisplayID()); JSON.stringify([b.size.width, b.size.height])',
        signal,
      )
      let parsed
      try {
        parsed = JSON.parse(stdout)
      } catch {
        throw new Error('could not determine the screen size in points; got ' + JSON.stringify(stdout))
      }
      const width = Math.round(parsed[0])
      const height = Math.round(parsed[1])
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        throw new Error('could not determine the screen size in points; got ' + JSON.stringify(stdout))
      }
      return { width, height }
    },

    /**
     * Current cursor position in points, via CoreGraphics through JXA.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<{x: number, y: number}>} cursor position in points.
     */
    async cursorPosition(signal) {
      const { stdout } = await jxa(
        'ObjC.import("CoreGraphics"); const e = $.CGEventCreate($()); const p = $.CGEventGetLocation(e); JSON.stringify([p.x, p.y])',
        signal,
      )
      const parsed = JSON.parse(stdout)
      return { x: Math.round(parsed[0]), y: Math.round(parsed[1]) }
    },

    /**
     * Capture a display (cursor included, no sound) to targetPath. Without
     * bounds this captures the main display exactly as before; with display
     * bounds it region-captures that display's rectangle in the global
     * coordinate space via `-R x,y,w,h`, which pins the capture to the chosen
     * display regardless of screencapture's display ordering.
     * @param {string} targetPath - destination file path.
     * @param {'png'|'jpg'} format - capture format.
     * @param {{x: number, y: number, width: number, height: number}|undefined} bounds - the
     *   display's global top-left-origin bounds; undefined captures the main display.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<void>} resolves after screencapture exits successfully.
     */
    async captureScreen(targetPath, format, bounds, signal) {
      // Legacy 3-argument callers pass the signal where `bounds` now sits.
      const legacySignal = bounds !== undefined && typeof bounds === 'object' && typeof bounds.aborted === 'boolean' ? bounds : undefined
      const resolvedBounds = legacySignal === undefined ? bounds : undefined
      const args = ['-x', '-C', '-t', format]
      if (resolvedBounds !== undefined) {
        args.push('-R' + Math.round(resolvedBounds.x) + ',' + Math.round(resolvedBounds.y) + ','
          + Math.round(resolvedBounds.width) + ',' + Math.round(resolvedBounds.height))
      }
      args.push(targetPath)
      try {
        await run(SCREENCAPTURE, args, { signal: signal ?? legacySignal })
      } catch (error) {
        const permission = permissionErrorFromStderr(error?.stderr ?? error?.message)
        throw permission ?? error
      }
    },

    /**
     * Left-click at one screen point: cliclick when present, otherwise the
     * System Events `click at` command.
     * @param {number} x - screen point x.
     * @param {number} y - screen point y.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<void>} resolves after the click was posted.
     */
    async leftClick(x, y, signal) {
      const cliclick = await resolveCliclick(signal)
      if (cliclick !== null) {
        await run(cliclick, ['c:' + x + ',' + y], { signal })
        return
      }
      await osascript(buildClickScript(x, y), signal)
    },

    /**
     * Double-click at one screen point (cliclick only).
     * @param {number} x - screen point x.
     * @param {number} y - screen point y.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<void>} resolves after the double click was posted.
     */
    async doubleClick(x, y, signal) {
      const cliclick = await requireCliclick(signal)
      await run(cliclick, ['dc:' + x + ',' + y], { signal })
    },

    /**
     * Right-click at one screen point (cliclick only).
     * @param {number} x - screen point x.
     * @param {number} y - screen point y.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<void>} resolves after the right click was posted.
     */
    async rightClick(x, y, signal) {
      const cliclick = await requireCliclick(signal)
      await run(cliclick, ['rc:' + x + ',' + y], { signal })
    },

    /**
     * Move the pointer without clicking (cliclick only).
     * @param {number} x - screen point x.
     * @param {number} y - screen point y.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<void>} resolves after the pointer moved.
     */
    async move(x, y, signal) {
      const cliclick = await requireCliclick(signal)
      await run(cliclick, ['m:' + x + ',' + y], { signal })
    },

    /**
     * Press, drag, and release between two screen points (cliclick only).
     * @param {{x: number, y: number}} start - press point.
     * @param {{x: number, y: number}} end - release point.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<void>} resolves after the drag was posted.
     */
    async drag(start, end, signal) {
      const cliclick = await requireCliclick(signal)
      await run(cliclick, [
        'dd:' + start.x + ',' + start.y,
        'w:80',
        'dm:' + end.x + ',' + end.y,
        'w:80',
        'du:' + end.x + ',' + end.y,
      ], { signal })
    },

    /**
     * Type text into the focused application via System Events keystroke.
     * @param {string} text - the text to type.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<void>} resolves after the text was typed.
     */
    async typeText(text, signal) {
      await osascript(buildKeystrokeScript(text), signal)
    },

    /**
     * Press one parsed key spec (optionally with modifiers) via System Events.
     * @param {{char?: string, code?: number, modifiers: string[]}} spec - a parseKeySpec result.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<void>} resolves after the key was pressed.
     */
    async pressKey(spec, signal) {
      await osascript(buildKeyScript(spec), signal)
    },

    /**
     * Scroll by pressing arrow keys (keyboard-based; macOS has no scriptable
     * scroll wheel without extra tooling).
     * @param {'up'|'down'|'left'|'right'} direction - scroll direction.
     * @param {number} amount - how many arrow presses to send.
     * @param {AbortSignal|undefined} signal - cancellation signal.
     * @returns {Promise<void>} resolves after the presses were sent.
     */
    async scroll(direction, amount, signal) {
      await osascript(buildScrollScript(direction, amount), signal)
    },
  }
}
