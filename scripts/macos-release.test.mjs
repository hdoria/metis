import test from 'node:test'
import * as releasePipeline from './macos-release.mjs'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  parseArgs, releasePaths, checkVersions, validateManifest, validateDraft,
  buildEnvironment, createPlan, draftRelease, hashFile, runner,
} from './macos-release.mjs'

const sha = 'a'.repeat(40)
const plan = { tag: 'v0.1.0', version: '0.1.0', sha, target: 'aarch64-apple-darwin', outputDir: `src-tauri/target/metis-release/v0.1.0-${sha.slice(0, 12)}` }
const manifest = {
  tag: plan.tag, version: plan.version, sourceSHA: sha, target: plan.target,
  architecture: 'arm64', teamIdentifier: 'C42XKG5G6X',
  dmg: { file: 'Metis_0.1.0_aarch64.dmg', sha256: 'b'.repeat(64) },
  notarization: { app: '11111111-1111-1111-1111-111111111111', dmg: '22222222-2222-2222-2222-222222222222' },
}

test('CLI accepts only the three explicit draft-safe commands and canonical semver', () => {
  for (const command of ['plan', 'build', 'draft']) assert.deepEqual(parseArgs([command, 'v0.1.0']), { command, tag: 'v0.1.0', version: '0.1.0' })
  for (const args of [['publish', 'v0.1.0'], ['draft', 'v0.1.0', '--publish'], ['plan', '../v0.1.0'], ['plan', 'v01.1.0'], ['plan'], ['plan', 'v0.1.0-01']]) assert.throws(() => parseArgs(args))
  assert.equal(parseArgs(['plan', 'v1.2.3-rc.1+build.2']).version, '1.2.3-rc.1+build.2')
})

test('versions must agree across all three source manifests', () => {
  checkVersions('0.1.0', '0.1.0', '0.1.0', '0.1.0')
  assert.throws(() => checkVersions('0.1.0', '0.1.0', '0.1.1', '0.1.0'))
})

test('release paths are deterministic, relative, and cannot escape the output root', () => {
  assert.equal(releasePaths('v0.1.0', sha).outputDir, plan.outputDir)
  assert.throws(() => releasePaths('../escape', sha))
  assert.throws(() => releasePaths('v0.1.0', '--argument'))
})

test('manifest rejects foreign source, team, filename traversal, and extra private fields', () => {
  validateManifest(manifest, plan)
  for (const replacement of [{ sourceSHA: 'c'.repeat(40) }, { architecture: 'x86_64' }, { teamIdentifier: 'OTHER' }, { token: 'secret' }, { dmg: { ...manifest.dmg, file: '../installer.dmg' } }, { notarization: { app: '', dmg: '' } }]) assert.throws(() => validateManifest({ ...manifest, ...replacement }, plan))
})

test('only a draft pointing to the exact source SHA can be replaced', () => {
  validateDraft({ isDraft: true, targetCommitish: sha, tagName: plan.tag }, plan)
  for (const release of [{ isDraft: false, targetCommitish: sha, tagName: plan.tag }, { isDraft: true, targetCommitish: 'main', tagName: plan.tag }, { isDraft: true, targetCommitish: sha, tagName: 'v9.9.9' }]) assert.throws(() => validateDraft(release, plan))
})

test('compilation environment drops Apple authentication and Sentry token without mutating parent', () => {
  const input = { APPLE_ID: 'private', APPLE_PASSWORD: 'private', APPLE_API_KEY: 'private', APPLE_SIGNING_IDENTITY: 'other', SENTRY_AUTH_TOKEN: 'private', SENTRY_DSN: 'dsn', PATH: 'path' }
  const output = buildEnvironment(input, plan)
  assert.equal(input.SENTRY_AUTH_TOKEN, 'private')
  assert.equal(output.SENTRY_AUTH_TOKEN, undefined)
  assert.equal(Object.keys(output).some((key) => key.startsWith('APPLE_')), false)
  assert.equal(output.SENTRY_RELEASE, `metis-native@0.1.0+${sha.slice(0, 12)}`)
  assert.equal(output.VITE_SENTRY_RELEASE, `metis-desktop@0.1.0+${sha.slice(0, 12)}`)
  assert.equal(output.SENTRY_ENVIRONMENT, 'production')
  assert.equal(output.TAURI_PLATFORM, 'macos')
})

test('prerelease metadata produces a unique release accepted by the desktop SDK', () => {
  const env = buildEnvironment({}, { ...plan, version: '1.2.3-rc.1+build.2' })
  assert.equal(env.VITE_SENTRY_RELEASE, `metis-desktop@1.2.3+rc.1.build.2.${sha.slice(0, 12)}`)
  assert.match(env.VITE_SENTRY_RELEASE, /^metis-desktop@\d+\.\d+\.\d+\+[0-9A-Za-z.-]+$/)
})

test('source plan validates repository versions and rejects dirty state before output', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'metis-release-test-'))
  try {
    mkdirSync(path.join(root, 'src-tauri'))
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version: '0.1.0' }))
    writeFileSync(path.join(root, 'src-tauri/tauri.conf.json'), JSON.stringify({ version: '0.1.0' }))
    writeFileSync(path.join(root, 'src-tauri/Cargo.toml'), '[package]\nname = "metis"\nversion = "0.1.0"\n')
    const commands = []
    const run = (_file, args) => { commands.push(args); return args[0] === 'status' ? '' : sha }
    assert.deepEqual(createPlan('v0.1.0', { root, run }), plan)
    assert.throws(() => createPlan('v0.1.0', { root, run: () => ' M package.json' }))
    assert.equal(commands[0][0], 'status')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('external failures expose only the safe phase identifier', () => {
  const phases = []
  const run = runner(process.cwd(), {}, () => { throw new Error('password=private'); }, (phase) => phases.push(phase))
  assert.throws(() => run('anything', ['private'], 'compile'), { message: 'macos-release: compile failed' })
  assert.deepEqual(phases, ['compile'])
})

test('progress reports command phases without arguments or captured private output', () => {
  const phases = []
  const run = runner(process.cwd(), {}, () => 'private-output', (phase) => phases.push(phase))
  assert.equal(run('/private/tool', ['private-argument'], 'native-build'), 'private-output')
  assert.deepEqual(phases, ['native-build'])
  assert.throws(() => run('tool', [], '/private/path'), /invalid command phase/)
  assert.deepEqual(phases, ['native-build'])
})

function draftFixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'metis-draft-test-'))
  const directory = path.join(root, plan.outputDir)
  mkdirSync(directory, { recursive: true })
  const dmg = path.join(directory, manifest.dmg.file)
  writeFileSync(dmg, 'installer')
  const actual = { ...manifest, dmg: { ...manifest.dmg, sha256: hashFile(dmg) } }
  writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(actual))
  writeFileSync(path.join(directory, 'SHA256SUMS'), `${actual.dmg.sha256}  ${actual.dmg.file}\n${hashFile(path.join(directory, 'manifest.json'))}  manifest.json\n`)
  return { root, dmg }
}

function mockGithub(overrides = {}, commands = []) {
  const responses = {
    git: '',
    'repo view': 'hdoria/metis',
    'run list': JSON.stringify([{ headSha: sha, conclusion: 'success' }]),
    'release list': JSON.stringify([{ tagName: plan.tag, isDraft: true }]),
    'release view': JSON.stringify({ tagName: plan.tag, isDraft: true, targetCommitish: sha }),
    'release create': '',
    'release upload': '',
    ...overrides,
  }
  return (file, args) => {
    commands.push([file, ...args])
    const key = file === 'git' ? 'git' : args.slice(0, 2).join(' ')
    assert.ok(Object.hasOwn(responses, key), `Unexpected command: ${key}`)
    return responses[key]
  }
}

test('draft fails closed on repository, CI, and release target before mutations', () => {
  const { root } = draftFixture()
  const scenarios = [
    { 'repo view': 'foreign/repo' },
    { 'run list': '[]' },
    { 'release view': JSON.stringify({ tagName: plan.tag, isDraft: false, targetCommitish: sha }) },
    { 'release view': JSON.stringify({ tagName: plan.tag, isDraft: true, targetCommitish: 'main' }) },
  ]
  try {
    for (const scenario of scenarios) {
      const commands = []
      assert.throws(() => draftRelease(plan, { root, run: mockGithub(scenario, commands) }))
      assert.equal(commands.some((command) => command.includes('create')), false)
      assert.equal(commands.some((command) => command.includes('upload')), false)
    }
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('installer checksum tampering fails before any external command', () => {
  const { root, dmg } = draftFixture()
  try {
    writeFileSync(dmg, 'tampered')
    assert.throws(() => draftRelease(plan, { root, run: () => assert.fail('No command expected') }), /installer checksum mismatch/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('draft creates only an unpublished release and uploads the three public assets', () => {
  const { root } = draftFixture()
  const commands = []
  try {
    draftRelease(plan, { root, run: mockGithub({ 'release list': '[]' }, commands) })
    const create = commands.find((command) => command.includes('create'))
    assert.ok(create.includes('--draft'))
    assert.equal(create.includes('--publish'), false)
    assert.equal(create[create.indexOf('--target') + 1], sha)
    const upload = commands.find((command) => command.includes('upload'))
    assert.deepEqual(upload.slice(4, 7).map((file) => path.basename(file)), [manifest.dmg.file, 'manifest.json', 'SHA256SUMS'])
    const ci = commands.find((command) => command.includes('run'))
    assert.equal(ci[ci.indexOf('--workflow') + 1], 'ci.yml')
    assert.equal(ci[ci.indexOf('--commit') + 1], sha)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

const nativeUUID = '9B25C3FC-4F90-3C83-9565-F9E84266E29E'
const nativeUpload = {
  org: 'popcode', project: 'metis-native', uploaded: true, filesUploaded: 2,
  files: [
    { name: 'metis', debugId: `${nativeUUID.toLowerCase().replaceAll('-', '')}-0`, state: 'ok' },
    { name: `${nativeUUID}.src.zip`, debugId: nativeUUID, state: 'ok' },
  ],
}

const nativeUploadFailures = [
  ['empty upload', { uploaded: false, files: [], filesUploaded: 0 }],
  ['missing source bundle', { files: [nativeUpload.files[0]] }],
  ['missing executable', { files: [nativeUpload.files[1]] }],
  ['executable UUID mismatch', { files: [{ ...nativeUpload.files[0], debugId: sha.slice(0, 32) }, nativeUpload.files[1]] }],
  ['source UUID mismatch', { files: [nativeUpload.files[0], { ...nativeUpload.files[1], debugId: sha.slice(0, 32) }] }],
  ['unsupported debug age', { files: [{ ...nativeUpload.files[0], debugId: `${nativeUUID}-1` }, nativeUpload.files[1]] }],
  ['wrong organization', { org: 'other' }],
  ['wrong project', { project: 'metis-desktop' }],
  ['missing project', { project: undefined }],
  ['insufficient upload count', { filesUploaded: 1 }],
]

for (const [name, overrides] of nativeUploadFailures) {
  test(`native symbol verification rejects ${name}`, () => {
    assert.throws(() => releasePipeline.validateNativeSymbols({ ...nativeUpload, ...overrides }, nativeUUID))
  })
}

for (const state of ['error', 'not_found', 'created', 'assembling', undefined]) {
  test(`native symbol verification rejects incomplete processing state ${state}`, () => {
    const files = [nativeUpload.files[0], { ...nativeUpload.files[1], state }]
    assert.throws(() => releasePipeline.validateNativeSymbols({ ...nativeUpload, files }, nativeUUID))
  })
}

test('native symbol verification accepts both processed matching UUIDs and returns the direct JSON result', () => {
  assert.equal(releasePipeline.validateNativeSymbols(nativeUpload, nativeUUID), nativeUpload)
})

test('notarization persists the submission ID before a separate wait can time out', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'metis-notary-test-'))
  const id = manifest.notarization.app
  const commands = []
  const run = (_file, args) => {
    commands.push(args)
    if (args[1] === 'submit') return JSON.stringify({ id, status: 'In Progress' })
    assert.equal(args[1], 'wait')
    assert.deepEqual(JSON.parse(readFileSync(path.join(directory, 'app-notary.json'), 'utf8')), { id, status: 'In Progress' })
    assert.equal(args[2], id)
    throw new Error('macos-release: app-notarization-wait failed')
  }
  try {
    assert.throws(() => releasePipeline.notarize('test.zip', 'app', { directory, run, notary: { METIS_NOTARY_PROFILE: 'test-profile', METIS_NOTARY_KEYCHAIN: '/test/keychain' } }), /app-notarization-wait failed/)
    assert.deepEqual(commands.map((args) => args[1]), ['submit', 'wait'])
    assert.equal(commands[0].includes('--wait'), false)
    assert.equal(commands[0].includes('--timeout'), false)
    assert.equal(commands[1][commands[1].indexOf('--timeout') + 1], '30m')
    for (const args of commands) {
      assert.equal(args[args.indexOf('--keychain-profile') + 1], 'test-profile')
      assert.equal(args[args.indexOf('--keychain') + 1], '/test/keychain')
      assert.equal(args[args.indexOf('--output-format') + 1], 'json')
    }
    assert.equal(JSON.parse(readFileSync(path.join(directory, 'app-notary.json'), 'utf8')).id, id)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('notarization stores the final accepted status and sanitized log after waiting', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'metis-notary-test-'))
  const id = manifest.notarization.app
  const commands = []
  const responses = {
    submit: { id, status: 'In Progress' },
    wait: { id, status: 'Accepted' },
    log: { status: 'Accepted', statusCode: 0, issues: [{ severity: 'warning', code: 1, path: '/private/source', message: 'private' }] },
  }
  const run = (_file, args) => { commands.push(args[1]); return JSON.stringify(responses[args[1]]) }
  try {
    assert.equal(releasePipeline.notarize('test.zip', 'app', { directory, run, notary: {} }), id)
    assert.deepEqual(commands, ['submit', 'wait', 'log'])
    assert.deepEqual(JSON.parse(readFileSync(path.join(directory, 'app-notary.json'), 'utf8')), { id, status: 'Accepted' })
    assert.deepEqual(JSON.parse(readFileSync(path.join(directory, 'app-notary-log.json'), 'utf8')), { jobId: id, status: 'Accepted', statusCode: 0, issues: [{ severity: 'warning', code: 1 }] })
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
