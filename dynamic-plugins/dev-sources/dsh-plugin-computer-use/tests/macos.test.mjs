import test from 'node:test'
import assert from 'node:assert/strict'
import { createMacBackend, PermissionDeniedError, permissionErrorFromStderr } from '../macos.js'

/** Fake run: routes by (file, args) with per-case behavior. */
function fakeRun(routes) {
  const calls = []
  const run = async (file, args, options) => {
    calls.push({ file, args, options })
    const handler = routes(file, args, options)
    if (typeof handler === 'string') return { stdout: handler, stderr: '' }
    if (handler instanceof Error) throw handler
    if (handler === undefined) throw new Error('unexpected run: ' + file + ' ' + JSON.stringify(args))
    return handler
  }
  run.calls = calls
  return run
}

const cliclickDetector = (file, args) => {
  if (args[0] === 'p') return '10,20'
  if (args[0] !== '-e' && args[0] !== '-l') return { stdout: '', stderr: '' }
  return undefined
}

test('permissionErrorFromStderr: accessibility signatures', () => {
  assert.ok(permissionErrorFromStderr('execution error: not allowed assistive access. (-25211)') instanceof PermissionDeniedError)
  assert.ok(permissionErrorFromStderr('System Events 遇到一个错误：发生权限违例。 (-10004)') instanceof PermissionDeniedError)
  assert.ok(permissionErrorFromStderr('osascript is not allowed assistive access (-1719)') instanceof PermissionDeniedError)
  assert.equal(permissionErrorFromStderr('some other error'), undefined)
})

test('permissionErrorFromStderr: screen recording signatures', () => {
  const error = permissionErrorFromStderr('could not create image from display')
  assert.ok(error instanceof PermissionDeniedError)
  assert.match(error.message, /Screen Recording/)
})

test('screenBounds: parses JXA display size', async () => {
  const run = fakeRun((file, args) => (args.includes('-l') ? '[1920.0, 1080.5]' : undefined))
  const backend = createMacBackend({ run })
  assert.deepEqual(await backend.screenBounds(undefined), { width: 1920, height: 1081 })
  const call = run.calls[0]
  assert.equal(call.file, '/usr/bin/osascript')
  assert.equal(call.args[0], '-l')
  assert.equal(call.args[1], 'JavaScript')
})

test('screenBounds: rejects garbage', async () => {
  const run = fakeRun(() => 'not json')
  const backend = createMacBackend({ run })
  await assert.rejects(() => backend.screenBounds(undefined), /could not determine the screen size/)
})

test('cursorPosition: parses and rounds', async () => {
  const run = fakeRun(() => '[790.2421875, 215.56640625]')
  const backend = createMacBackend({ run })
  assert.deepEqual(await backend.cursorPosition(undefined), { x: 790, y: 216 })
})

test('captureScreen: absolute screencapture path, translated permission failure', async () => {
  const failure = Object.assign(new Error('screencapture failed'), { stderr: 'could not create image from display' })
  const run = fakeRun(() => failure)
  const backend = createMacBackend({ run })
  await assert.rejects(() => backend.captureScreen('/tmp/x.png', 'png', undefined), PermissionDeniedError)
  assert.equal(run.calls[0].file, '/usr/sbin/screencapture')
  assert.deepEqual(run.calls[0].args, ['-x', '-C', '-t', 'png', '/tmp/x.png'])
})

test('leftClick: uses cliclick when detected', async () => {
  const run = fakeRun(cliclickDetector)
  const backend = createMacBackend({ run })
  await backend.leftClick(512, 384, undefined)
  const click = run.calls.at(-1)
  assert.equal(click.file, 'cliclick')
  assert.deepEqual(click.args, ['c:512,384'])
})

test('leftClick: falls back to System Events click at when cliclick is absent', async () => {
  const absent = () => Object.assign(new Error('enoent'), { stderr: '' })
  const run = fakeRun((file, args) => {
    if (args[0] === 'p') throw absent()
    if (file === '/usr/bin/osascript') return { stdout: '', stderr: '' }
    return undefined
  })
  const backend = createMacBackend({ run })
  await backend.leftClick(512, 384, undefined)
  const script = run.calls.at(-1).args[1]
  assert.match(script, /click at \{512, 384\}/)
})

test('leftClick: fallback translates accessibility denial', async () => {
  const run = fakeRun((file, args) => {
    if (args[0] === 'p') throw Object.assign(new Error('enoent'), { stderr: '' })
    throw Object.assign(new Error('osascript error'), {
      stderr: 'execution error: not allowed assistive access. (-25211)',
    })
  })
  const backend = createMacBackend({ run })
  await assert.rejects(() => backend.leftClick(1, 2, undefined), PermissionDeniedError)
})

test('doubleClick: requires cliclick', async () => {
  const run = fakeRun(() => Object.assign(new Error('enoent'), { stderr: '' }))
  const backend = createMacBackend({ run })
  await assert.rejects(() => backend.doubleClick(1, 2, undefined), /brew install cliclick/)
})

test('doubleClick, rightClick, move: cliclick op names', async () => {
  const run = fakeRun(cliclickDetector)
  const backend = createMacBackend({ run })
  await backend.doubleClick(1, 2, undefined)
  await backend.rightClick(3, 4, undefined)
  await backend.move(5, 6, undefined)
  assert.deepEqual(run.calls.at(-3).args, ['dc:1,2'])
  assert.deepEqual(run.calls.at(-2).args, ['rc:3,4'])
  assert.deepEqual(run.calls.at(-1).args, ['m:5,6'])
})

test('drag: press, wait, drag-move, wait, release', async () => {
  const run = fakeRun(cliclickDetector)
  const backend = createMacBackend({ run })
  await backend.drag({ x: 10, y: 20 }, { x: 30, y: 40 }, undefined)
  assert.deepEqual(run.calls.at(-1).args, ['dd:10,20', 'w:80', 'dm:30,40', 'w:80', 'du:30,40'])
})

test('typeText, pressKey, scroll: osascript scripts', async () => {
  const run = fakeRun((file, args) => (file === '/usr/bin/osascript' ? { stdout: '', stderr: '' } : undefined))
  const backend = createMacBackend({ run })
  await backend.typeText('hi\nthere', undefined)
  assert.match(run.calls[0].args[1], /keystroke \("hi" & return & "there"\)/)
  await backend.pressKey({ char: 'c', modifiers: ['command down'] }, undefined)
  assert.match(run.calls[1].args[1], /keystroke \("c"\) using \{command down\}/)
  await backend.scroll('down', 3, undefined)
  assert.match(run.calls[2].args[1], /repeat 3 times/)
})

test('cliclick detection is cached', async () => {
  let detections = 0
  const run = fakeRun((file, args) => {
    if (args[0] === 'p') {
      detections++
      return '1,2'
    }
    if (args[0] !== '-e' && args[0] !== '-l') return { stdout: '', stderr: '' }
    return undefined
  })
  const backend = createMacBackend({ run })
  await backend.leftClick(1, 1, undefined)
  await backend.leftClick(2, 2, undefined)
  assert.equal(detections, 1)
})

test('listDisplays: parses NSScreen frames into top-left global bounds', async () => {
  // Two screens: main 1920x1080 at cocoa (0,0), secondary 1512x982 at cocoa
  // (1920,-267) — the cocoa y converts to top-left y = 1080 - (-267) - 982 = 365.
  const jxaOutput = JSON.stringify([
    { id: 3, index: 1, isMain: true, x: 0, y: 0, width: 1920, height: 1080 },
    { id: 1, index: 2, isMain: false, x: 1920, y: 365, width: 1512, height: 982 },
  ])
  const run = fakeRun((file, args) => (args[0] === '-l' && args[1] === 'JavaScript' ? jxaOutput : undefined))
  const backend = createMacBackend({ run })
  const displays = await backend.listDisplays(undefined)
  assert.equal(run.calls[0].file, '/usr/bin/osascript')
  assert.match(run.calls[0].args[3], /NSScreen\.screens/)
  assert.deepEqual(displays, [
    { id: 3, index: 1, isMain: true, x: 0, y: 0, width: 1920, height: 1080 },
    { id: 1, index: 2, isMain: false, x: 1920, y: 365, width: 1512, height: 982 },
  ])
})

test('listDisplays: drops malformed records and rejects garbage', async () => {
  const partial = JSON.stringify([
    { id: 3, index: 1, isMain: true, x: 0, y: 0, width: 1920, height: 1080 },
    { id: -1, index: 2, isMain: false, x: 0, y: 0, width: 0, height: 0 },
    null,
  ])
  const run = fakeRun((file, args) => (args[0] === '-l' ? partial : undefined))
  const backend = createMacBackend({ run })
  assert.deepEqual(await backend.listDisplays(undefined), [
    { id: 3, index: 1, isMain: true, x: 0, y: 0, width: 1920, height: 1080 },
  ])

  const garbage = fakeRun(() => 'not json')
  await assert.rejects(() => createMacBackend({ run: garbage }).listDisplays(undefined), /could not enumerate/)
})

test('captureScreen: region bounds add -R and keep the legacy 3-arg call', async () => {
  const run = fakeRun(() => ({ stdout: '', stderr: '' }))
  const backend = createMacBackend({ run })
  await backend.captureScreen('/tmp/a.png', 'png', undefined, undefined)
  assert.deepEqual(run.calls[0].args, ['-x', '-C', '-t', 'png', '/tmp/a.png'])
  await backend.captureScreen('/tmp/b.png', 'jpg', { x: 1920, y: 365.4, width: 1512, height: 982 }, undefined)
  assert.deepEqual(run.calls[1].args, ['-x', '-C', '-t', 'jpg', '-R1920,365,1512,982', '/tmp/b.png'])
  // Legacy 3-argument callers passed the signal as the third argument.
  await backend.captureScreen('/tmp/c.png', 'png', undefined)
  assert.deepEqual(run.calls[2].args, ['-x', '-C', '-t', 'png', '/tmp/c.png'])
})

test('probeEnvironment: reports each capability independently', async () => {
  // Accessibility granted, screen recording denied, cliclick present.
  const run = fakeRun((file, args) => {
    if (file === '/usr/sbin/screencapture') {
      return Object.assign(new Error('capture failed'), { stderr: 'could not create image from display' })
    }
    if (file === '/usr/bin/osascript' && args[0] === '-e') return 'true'
    if (args[0] === 'p') return '1,2'
    return undefined
  })
  const backend = createMacBackend({ run })
  const state = await backend.probeEnvironment(undefined)
  assert.deepEqual(state, { screenRecording: false, accessibility: true, cliclick: true })
  // The probe capture uses a 1x1 region and cleans up its temp file.
  assert.match(run.calls[0].args.find(a => a.startsWith('-R')), /^-R0,0,1,1$/)
})

test('probeEnvironment: granted screen recording and missing cliclick', async () => {
  const run = fakeRun((file, args) => {
    if (file === '/usr/sbin/screencapture') return { stdout: '', stderr: '' }
    if (file === '/usr/bin/osascript' && args[0] === '-e') return 'false'
    if (args[0] === 'p') throw new Error('command not found')
    return undefined
  })
  const backend = createMacBackend({ run })
  const state = await backend.probeEnvironment(undefined)
  assert.deepEqual(state, { screenRecording: true, accessibility: false, cliclick: false })
})
