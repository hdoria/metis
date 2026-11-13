import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { runKeychain } from './macos-release-keychain.mjs'

function nativeFailure(fixture) {
  return new Error(`native stderr exposes ${fixture.env.METIS_APPLE_CERTIFICATE_PASSWORD} ${fixture.env.METIS_APPLE_NOTARY_PASSWORD}`)
}

function rejectSelectedStage(fixture, selectedStage, stage) {
  if (selectedStage === stage) throw nativeFailure(fixture)
}

function fakeSearchList(fixture, fail, args) {
  if (!args.includes('-s')) return fixture.search.map(JSON.stringify).join('\n')
  rejectSelectedStage(fixture, fail, 'list-keychains')
  if (args.includes(fixture.keychain)) rejectSelectedStage(fixture, fail, 'search')
  fixture.search = args.slice(4)
  return ''
}

function fakeCertificateImport(fixture, fail) {
  assert.equal(statSync(fixture.certificate).mode & 0o777, 0o600)
  assert.equal(readFileSync(fixture.certificate, 'utf8'), 'test-pkcs12-content')
  rejectSelectedStage(fixture, fail, 'import')
}

function fakeKeychainCreation(fixture, fail) {
  writeFileSync(fixture.keychain, 'fake private keychain')
  rejectSelectedStage(fixture, fail, 'create-keychain')
}

function fakeKeychainDeletion(fixture, fail) {
  rejectSelectedStage(fixture, fail, 'delete-keychain')
  rmSync(fixture.keychain, { force: true })
  fixture.search = fixture.search.filter((path) => path !== fixture.keychain)
}

function createFakeRunner(fixture, fail) {
  const handlers = {
    'list-keychains': (args) => fakeSearchList(fixture, fail, args),
    'create-keychain': () => fakeKeychainCreation(fixture, fail),
    import: () => fakeCertificateImport(fixture, fail),
    'delete-keychain': () => fakeKeychainDeletion(fixture, fail),
  }
  return (command, args) => {
    fixture.calls.push([command, [...args]])
    const stage = command === 'xcrun' ? 'notary' : args[0]
    const handler = handlers[stage]
    if (handler) return handler(args)
    rejectSelectedStage(fixture, fail, stage)
    return ''
  }
}

function fixture(t, fail = '') {
  const directory = mkdtempSync(join(tmpdir(), 'metis-ci-keychain-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const original = ['/Users/runner/Library/Keychains/login.keychain-db', '/tmp/a space;$(echo no).keychain-db']
  const state = {
    keychain: join(directory, 'metis-release.keychain-db'),
    metadata: join(directory, 'metis-release-keychain-state.json'),
    certificate: join(directory, 'metis-release-certificate.p12'),
    calls: [], original, search: [...original],
    env: {
      GITHUB_ACTIONS: 'true', RUNNER_TEMP: directory, GITHUB_ENV: join(directory, 'github-env'),
      METIS_APPLE_CERTIFICATE: Buffer.from('test-pkcs12-content').toString('base64'),
      METIS_APPLE_CERTIFICATE_PASSWORD: 'certificate-test-password',
      METIS_APPLE_NOTARY_PASSWORD: 'notary-test-password',
    },
  }
  state.run = createFakeRunner(state, fail)
  return state
}

test('sets up an isolated signing keychain and restores the exact search list on cleanup', (t) => {
  const f = fixture(t)
  runKeychain('setup', f)
  assert.deepEqual(f.search, [f.keychain, ...f.original])
  assert.equal(statSync(f.metadata).mode & 0o777, 0o600)
  assert.deepEqual(JSON.parse(readFileSync(f.metadata, 'utf8')), f.original)
  assert.equal(existsSync(f.certificate), false)
  assert.equal(readFileSync(f.env.GITHUB_ENV, 'utf8'), [
    'METIS_NOTARY_PROFILE=metis-release-ci', `METIS_NOTARY_KEYCHAIN=${f.keychain}`,
    'APPLE_SIGNING_IDENTITY=Developer ID Application: Popcode (C42XKG5G6X)', '',
  ].join('\n'))
  const commands = f.calls
  assert.ok(commands.some(([file, args]) => file === 'security' && args[0] === 'set-key-partition-list' && args.includes('apple-tool:,apple:,codesign:') && args.at(-1) === f.keychain))
  const notary = commands.find(([file]) => file === 'xcrun')[1]
  assert.deepEqual(notary, ['notarytool', 'store-credentials', 'metis-release-ci', '--keychain', f.keychain,
    '--apple-id', 'contato@popcode.com.br', '--team-id', 'C42XKG5G6X', '--password', f.env.METIS_APPLE_NOTARY_PASSWORD])
  assert.ok(commands.every(([file]) => ['security', 'xcrun'].includes(file)))
  runKeychain('cleanup', f)
  assert.deepEqual(f.search, f.original)
  assert.equal(existsSync(f.keychain), false)
  assert.equal(existsSync(f.metadata), false)
  const count = f.calls.length
  runKeychain('cleanup', f)
  assert.equal(f.calls.length, count)
})

for (const stage of ['create-keychain', 'unlock-keychain', 'set-keychain-settings', 'import', 'set-key-partition-list', 'search', 'notary']) {
  test(`cleans partial setup after ${stage} failure without exposing secrets`, (t) => {
    const f = fixture(t, stage)
    assert.throws(() => runKeychain('setup', f), (error) => {
      assert.doesNotMatch(error.message, /certificate-test-password|notary-test-password|native stderr/)
      assert.match(error.message, /macOS release keychain: .* failed/)
      return true
    })
    assert.deepEqual(f.search, f.original)
    assert.equal(existsSync(f.keychain), false)
    assert.equal(existsSync(f.metadata), false)
    assert.equal(existsSync(f.certificate), false)
    assert.equal(existsSync(f.env.GITHUB_ENV), false)
  })
}

test('refuses all actions outside Actions and unsafe runner paths before invoking commands', (t) => {
  for (const overrides of [{ GITHUB_ACTIONS: '' }, { GITHUB_ACTIONS: 'false' }, { RUNNER_TEMP: 'relative' }, { RUNNER_TEMP: '/tmp/invalid\nINJECTED=yes' }]) {
    for (const action of ['setup', 'cleanup']) {
      const f = fixture(t)
      Object.assign(f.env, overrides)
      assert.throws(() => runKeychain(action, f))
      assert.equal(f.calls.length, 0)
    }
  }
})

test('rejects missing secrets, invalid base64, and unsupported actions before commands', (t) => {
  for (const overrides of [{ METIS_APPLE_CERTIFICATE: '$invalid' }, { METIS_APPLE_CERTIFICATE_PASSWORD: '' }, { METIS_APPLE_NOTARY_PASSWORD: '' }, { GITHUB_ENV: '' }]) {
    const f = fixture(t)
    Object.assign(f.env, overrides)
    assert.throws(() => runKeychain('setup', f))
    assert.equal(f.calls.length, 0)
  }
  const f = fixture(t)
  assert.throws(() => runKeychain('delete-user-keychain', f))
  assert.equal(f.calls.length, 0)
})

test('does not overwrite or delete a preexisting keychain without ownership metadata', (t) => {
  const f = fixture(t)
  writeFileSync(f.keychain, 'unrelated preexisting data')
  assert.throws(() => runKeychain('setup', f))
  runKeychain('cleanup', f)
  assert.equal(readFileSync(f.keychain, 'utf8'), 'unrelated preexisting data')
  assert.equal(f.calls.length, 0)
})

test('retains metadata when restoring the search list fails so cleanup can be retried', (t) => {
  const f = fixture(t)
  runKeychain('setup', f)
  const failingRun = (command, args) => {
    if (args[0] === 'list-keychains') throw new Error('private command output')
    return f.run(command, args)
  }
  assert.throws(() => runKeychain('cleanup', { env: f.env, run: failingRun }), /cleanup failed/)
  assert.equal(existsSync(f.metadata), true)
  runKeychain('cleanup', f)
  assert.deepEqual(f.search, f.original)
  assert.equal(existsSync(f.metadata), false)
})


test('cleans up when writing the GitHub environment fails', (t) => {
  const f = fixture(t)
  f.env.GITHUB_ENV = f.env.RUNNER_TEMP
  assert.throws(() => runKeychain('setup', f), /write GitHub environment failed/)
  assert.deepEqual(f.search, f.original)
  assert.equal(existsSync(f.certificate), false)
  assert.equal(existsSync(f.keychain), false)
  assert.equal(existsSync(f.metadata), false)
})

test('rejects unsafe metadata without changing any keychain settings', (t) => {
  for (const content of ['["-s"]', '["/tmp/path\\nOTHER=value"]', '{}']) {
    const f = fixture(t)
    writeFileSync(f.metadata, content)
    assert.throws(() => runKeychain('cleanup', f), /cleanup failed/)
    assert.equal(f.calls.length, 0)
  }
  const f = fixture(t)
  const elsewhere = join(f.env.RUNNER_TEMP, 'unrelated.json')
  writeFileSync(elsewhere, JSON.stringify(f.original))
  symlinkSync(elsewhere, f.metadata)
  assert.throws(() => runKeychain('cleanup', f), /cleanup failed/)
  assert.equal(f.calls.length, 0)
  assert.equal(readFileSync(elsewhere, 'utf8'), JSON.stringify(f.original))
})

test('rejects a dangling keychain symlink during setup without following it', (t) => {
  const f = fixture(t)
  const target = join(f.env.RUNNER_TEMP, 'must-not-create.keychain-db')
  symlinkSync(target, f.keychain)
  assert.throws(() => runKeychain('setup', f), /ownership validation failed/)
  assert.equal(f.calls.length, 0)
  assert.equal(existsSync(target), false)
})

test('the CLI refuses local execution without logging credentials or a stack trace', () => {
  const result = spawnSync(process.execPath, ['scripts/macos-release-keychain.mjs', 'setup'], {
    encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: 'false', METIS_APPLE_NOTARY_PASSWORD: 'cli-test-secret' },
  })
  assert.equal(result.status, 1)
  assert.equal(result.stdout, '')
  assert.equal(result.stderr, 'macOS release keychain: GitHub Actions guard failed\n')
})


test('restores a stale original search-list entry even though native deletion removes it', (t) => {
  const f = fixture(t)
  const original = [f.keychain, ...f.original]
  const run = (command, args) => args[0] === 'list-keychains' && !args.includes('-s')
    ? original.map(JSON.stringify).join('\n') : f.run(command, args)
  runKeychain('setup', { env: f.env, run })
  runKeychain('cleanup', f)
  assert.deepEqual(f.search, original)
})

test('restores original settings even when keychain deletion fails and can retry deletion', (t) => {
  const f = fixture(t)
  runKeychain('setup', f)
  const run = (command, args) => {
    if (args[0] === 'delete-keychain') throw new Error('native deletion failed')
    return f.run(command, args)
  }
  assert.throws(() => runKeychain('cleanup', { env: f.env, run }), /cleanup failed/)
  assert.deepEqual(f.search, f.original)
  assert.equal(existsSync(f.metadata), true)
  assert.equal(existsSync(f.keychain), true)
  runKeychain('cleanup', f)
  assert.equal(existsSync(f.keychain), false)
  assert.equal(existsSync(f.metadata), false)
})
