import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ACTIONS,
  buildClickScript,
  buildKeyScript,
  buildKeystrokeScript,
  buildScrollScript,
  effectiveActions,
  escapeAppleScriptString,
  imageToPoints,
  parseKeySpec,
  pointToImage,
  resolveDisplaySetting,
  validateActionList,
} from '../key-script.js'

test('parseKeySpec: single character', () => {
  assert.deepEqual(parseKeySpec('a'), { char: 'a', modifiers: [] })
  assert.deepEqual(parseKeySpec('C'), { char: 'C', modifiers: [] })
})

test('parseKeySpec: named key by case-insensitive name', () => {
  assert.deepEqual(parseKeySpec('Return'), { code: 36, modifiers: [] })
  assert.deepEqual(parseKeySpec('PAGEUP'), { code: 116, modifiers: [] })
  assert.deepEqual(parseKeySpec('esc'), { code: 53, modifiers: [] })
})

test('parseKeySpec: combo with aliases', () => {
  assert.deepEqual(parseKeySpec('cmd+c'), { char: 'c', modifiers: ['command down'] })
  assert.deepEqual(parseKeySpec('meta+c'), { char: 'c', modifiers: ['command down'] })
  assert.deepEqual(parseKeySpec('ctrl+shift+Return'), { code: 36, modifiers: ['control down', 'shift down'] })
  assert.deepEqual(parseKeySpec('option+F4'), { code: 118, modifiers: ['option down'] })
})

test('parseKeySpec: rejects unknown modifiers, duplicates, and unknown keys', () => {
  assert.throws(() => parseKeySpec('hyper+c'), /unknown modifier/)
  assert.throws(() => parseKeySpec('cmd+cmd+c'), /duplicate modifier/)
  assert.throws(() => parseKeySpec('capslock'), /unknown key/)
  assert.throws(() => parseKeySpec('++'), /must name a key|unknown key/)
  assert.throws(() => parseKeySpec(''), /must name a key/)
})

test('buildKeystrokeScript: plain, escaped, newline, tab', () => {
  assert.equal(
    buildKeystrokeScript('hello'),
    'tell application "System Events"\n  keystroke ("hello")\nend tell',
  )
  assert.equal(
    buildKeystrokeScript('a"b\\c'),
    'tell application "System Events"\n  keystroke ("a\\"b\\\\c")\nend tell',
  )
  assert.equal(
    buildKeystrokeScript('one\ntwo'),
    'tell application "System Events"\n  keystroke ("one" & return & "two")\nend tell',
  )
  assert.equal(
    buildKeystrokeScript('a\tb'),
    'tell application "System Events"\n  keystroke ("a" & tab & "b")\nend tell',
  )
  assert.equal(
    buildKeystrokeScript('你好'),
    'tell application "System Events"\n  keystroke ("你好")\nend tell',
  )
})

test('buildKeyScript: char and code branches, with and without modifiers', () => {
  assert.equal(
    buildKeyScript({ char: 'c', modifiers: ['command down'] }),
    'tell application "System Events"\n  keystroke ("c") using {command down}\nend tell',
  )
  assert.equal(
    buildKeyScript({ code: 36, modifiers: [] }),
    'tell application "System Events"\n  key code 36\nend tell',
  )
})

test('buildClickScript: builds point and rejects non-integers', () => {
  assert.equal(
    buildClickScript(512, 384),
    'tell application "System Events"\n  click at {512, 384}\nend tell',
  )
  assert.throws(() => buildClickScript(1.5, 2), /x must be an integer/)
  assert.throws(() => buildClickScript(1, Number.NaN), /y must be an integer/)
})

test('buildScrollScript: all directions and amount', () => {
  assert.match(buildScrollScript('down', 5), /repeat 5 times/)
  assert.match(buildScrollScript('down', 5), /key code 125/)
  assert.match(buildScrollScript('up', 1), /key code 126/)
  assert.match(buildScrollScript('left', 2), /key code 123/)
  assert.match(buildScrollScript('right', 3), /key code 124/)
  assert.throws(() => buildScrollScript('sideways', 1), /unknown scroll direction/)
  assert.throws(() => buildScrollScript('up', 1.5), /amount must be an integer/)
})

test('imageToPoints: identity, scale-up, scale-down, clamping', () => {
  const identity = { attachedWidth: 1920, attachedHeight: 1080, screenWidth: 1920, screenHeight: 1080 }
  assert.deepEqual(imageToPoints(100, 200, identity), { x: 100, y: 200 })

  const doubled = { attachedWidth: 960, attachedHeight: 540, screenWidth: 1920, screenHeight: 1080 }
  assert.deepEqual(imageToPoints(480, 270, doubled), { x: 960, y: 540 })

  const halved = { attachedWidth: 3840, attachedHeight: 2160, screenWidth: 1920, screenHeight: 1080 }
  assert.deepEqual(imageToPoints(3840, 2160, halved), { x: 1920, y: 1080 })
  assert.deepEqual(imageToPoints(-10, 20000, halved), { x: 0, y: 1080 })

  const uneven = { attachedWidth: 1000, attachedHeight: 1000, screenWidth: 1920, screenHeight: 100 }
  assert.deepEqual(imageToPoints(500, 500, uneven), { x: 960, y: 50 })
  assert.throws(() => imageToPoints(1.5, 2, identity), /coordinate\[0\] must be an integer/)
})

test('imageToPoints: origin offset maps a secondary display into global points', () => {
  // A 1512x982-point display at global origin (1920, 365), captured 2x retina.
  const mapping = { attachedWidth: 3024, attachedHeight: 1964, screenWidth: 1512, screenHeight: 982, originX: 1920, originY: 365 }
  assert.deepEqual(imageToPoints(0, 0, mapping), { x: 1920, y: 365 })
  assert.deepEqual(imageToPoints(3024, 1964, mapping), { x: 3432, y: 1347 })
  assert.deepEqual(imageToPoints(1512, 982, mapping), { x: 2676, y: 856 })
  // Clamping stays within the captured display, not the global origin.
  assert.deepEqual(imageToPoints(-100, -100, mapping), { x: 1920, y: 365 })
  assert.deepEqual(imageToPoints(99999, 99999, mapping), { x: 3432, y: 1347 })
  // Main display keeps the legacy behavior when origin is absent.
  const legacy = { attachedWidth: 1000, attachedHeight: 1000, screenWidth: 1920, screenHeight: 100 }
  assert.deepEqual(imageToPoints(500, 500, legacy), { x: 960, y: 50 })
})

test('pointToImage: global points back to image pixels with inside flag', () => {
  const mapping = { attachedWidth: 3024, attachedHeight: 1964, screenWidth: 1512, screenHeight: 982, originX: 1920, originY: 365 }
  assert.deepEqual(pointToImage(1920, 365, mapping), { x: 0, y: 0, inside: true })
  assert.deepEqual(pointToImage(2676, 856, mapping), { x: 1512, y: 982, inside: true })
  // Points on another display report inside: false with edge-clamped pixels.
  const outside = pointToImage(100, 100, mapping)
  assert.equal(outside.inside, false)
  assert.deepEqual([outside.x, outside.y], [0, 0])
  // Main display without origin stays inside everywhere on-screen.
  const legacy = { attachedWidth: 1000, attachedHeight: 1000, screenWidth: 1920, screenHeight: 1080 }
  assert.equal(pointToImage(500, 500, legacy).inside, true)
  assert.equal(pointToImage(5000, 500, legacy).inside, false)
})

test('resolveDisplaySetting: main, by index, loud failure', () => {
  const displays = [
    { id: 3, index: 1, isMain: true, x: 0, y: 0, width: 1920, height: 1080 },
    { id: 1, index: 2, isMain: false, x: 1920, y: 365, width: 1512, height: 982 },
  ]
  assert.deepEqual(resolveDisplaySetting(undefined, displays), displays[0])
  assert.deepEqual(resolveDisplaySetting('main', displays), displays[0])
  assert.deepEqual(resolveDisplaySetting('', displays), displays[0])
  assert.deepEqual(resolveDisplaySetting('2', displays), displays[1])
  assert.deepEqual(resolveDisplaySetting('1', displays), displays[0])
  assert.deepEqual(resolveDisplaySetting('1', [displays[1], displays[0]]), displays[0])
  // Display IDs are deliberately not accepted: id 1 is ambiguous against
  // 1-based index 1, and the settings UI only ever stores 'main' or an index.
  assert.throws(() => resolveDisplaySetting('7', displays), /display \(7\) is not present/)
  assert.throws(() => resolveDisplaySetting('main', []), /no active display/)
})

test('effectiveActions: deployment gate intersect user denials', () => {
  const allowed = ['screenshot', 'cursor_position', 'left_click', 'type']
  assert.deepEqual(effectiveActions(allowed, undefined), allowed)
  assert.deepEqual(effectiveActions(allowed, {}), allowed)
  assert.deepEqual(effectiveActions(allowed, { type: false }), ['screenshot', 'cursor_position', 'left_click'])
  assert.deepEqual(effectiveActions(allowed, { type: false, left_click: false }), ['screenshot', 'cursor_position'])
  // Unknown user keys and non-boolean entries are ignored.
  assert.deepEqual(effectiveActions(allowed, { not_an_action: false, screenshot: 'no' }), allowed)
  assert.deepEqual(effectiveActions(undefined, undefined), [])
})

test('validateActionList: valid list, dedupe, loud failures', () => {
  assert.deepEqual(validateActionList(['screenshot', 'left_click', 'screenshot']), ['screenshot', 'left_click'])
  assert.deepEqual(validateActionList(ACTIONS.slice()), ACTIONS.slice())
  assert.throws(() => validateActionList([]), /non-empty array/)
  assert.throws(() => validateActionList(undefined), /non-empty array/)
  assert.throws(() => validateActionList(['not-an-action']), /unknown action "not-an-action"/)
  assert.throws(() => validateActionList(['screenshot', 42]), /unknown action 42/)
})

test('escapeAppleScriptString: backslash and quote only', () => {
  assert.equal(escapeAppleScriptString('\\'), '\\\\')
  assert.equal(escapeAppleScriptString('"'), '\\"')
  assert.equal(escapeAppleScriptString('a\nb'), 'a\nb')
})
