import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { includedFiles, parseUpdates, validateReport } from './codescene-pre-push.mjs'

const script = fileURLToPath(new URL('./codescene-pre-push.mjs', import.meta.url))
const zero = '0'.repeat(40)
const generatedFiles = [
  'apps/mobile/assets/diagram-renderer.html',
  'apps/mobile/src/components/workspace/MobileWysiwygTentapEditorHtml.ts',
  'apps/mobile/src/ui/theme/desktopThemes.generated.json',
  'src-tauri/resources/agent-docs/nested/document.md',
]
const retainedFiles = [
  'apps/mobile/scripts/build-diagram-renderer.ts',
  'apps/mobile/scripts/generate-desktop-themes.ts',
  'scripts/build-agent-docs.mjs',
  'scripts/build-agent-docs.test.mjs',
  'apps/mobile/src/fixtures/workspaceFixtures.ts',
  'apps/mobile/src/fixtures/workspaceFixtures.test.ts',
  'src-tauri/src/vault/mod_tests/fixtures/golden/demo-vault-v2.json',
  'src-tauri/resources/agent-docs-source/template.md',
]

function report(metadata = {}, results = []) {
  return {
    metadata: {
      status: 'no-issues-found',
      'total-modified-file-count': 1,
      'code-health-eligible-file-count': 1,
      'checked-file-count': 1,
      ...metadata,
    },
    results,
  }
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'metis-codescene-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const cwd = join(root, 'repo')
  const home = join(root, 'isolated-home')
  mkdirSync(cwd)
  mkdirSync(home)
  const log = join(root, 'calls.jsonl')
  const behavior = join(root, 'behavior.json')
  const fake = join(root, 'fake-codescene')
  writeFileSync(behavior, '{}')
  writeFileSync(fake, `#!${process.execPath}
const fs = require('node:fs');
const input = fs.readFileSync(0, 'utf8');
fs.appendFileSync(process.env.FAKE_CS_LOG, JSON.stringify({ args: process.argv.slice(2), input }) + '\\n');
const behavior = JSON.parse(fs.readFileSync(process.env.FAKE_CS_BEHAVIOR, 'utf8'));
const count = input.split('\\0').filter(Boolean).length;
const report = { metadata: {
  status: 'no-issues-found',
  'total-modified-file-count': count,
  'code-health-eligible-file-count': count,
  'checked-file-count': count,
}, results: [] };
if (behavior.signal) process.kill(process.pid, behavior.signal);
process.stdout.write(Object.hasOwn(behavior, 'output') ? behavior.output : JSON.stringify(behavior.report ?? report));
process.exitCode = behavior.exitCode ?? 0;
`)
  chmodSync(fake, 0o755)
  // Do not inherit credentials, user's Git config, hooks, or executable overrides.
  const env = {
    PATH: process.env.PATH,
    HOME: home,
    XDG_CONFIG_HOME: home,
    GIT_CONFIG_GLOBAL: join(home, '.gitconfig'),
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    LC_ALL: 'C',
    METIS_CODESCENE_BIN: fake,
    FAKE_CS_LOG: log,
    FAKE_CS_BEHAVIOR: behavior,
  }
  function run(command, args, options = {}) {
    const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', timeout: 30_000, ...options })
    assert.ifError(result.error)
    return result
  }
  function git(...args) {
    const result = run('git', args)
    assert.equal(result.status, 0, result.stderr)
    return result.stdout.trim()
  }
  function write(path, content) {
    mkdirSync(dirname(join(cwd, path)), { recursive: true })
    writeFileSync(join(cwd, path), content)
  }
  function commit(files) {
    for (const [path, content] of Object.entries(files)) write(path, content)
    git('add', '--all')
    git('commit', '--quiet', '-m', 'test: update disposable fixture')
    return git('rev-parse', 'HEAD')
  }
  git('init', '--quiet', '--initial-branch=main')
  git('config', 'user.name', 'CodeScene test')
  git('config', 'user.email', 'codescene-test@example.invalid')
  const base = commit({ 'src/first.ts': 'export const first = 1\n' })
  return {
    cwd, env, base, git, write, commit,
    configure: (value) => writeFileSync(behavior, JSON.stringify(value)),
    calls: () => existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line)) : [],
    invoke: (args, input = '', overrides = {}) => run(process.execPath, [script, ...args], {
      input, env: { ...env, ...overrides },
    }),
  }
}

function update(head, base, branch = 'feature') {
  return `refs/heads/${branch} ${head} refs/heads/${branch} ${base}\n`
}

function assertCall(call, base, head, paths) {
  assert.ok(call, 'CodeScene must be invoked')
  assert.equal(call.args[0], 'delta')
  assert.ok(call.args.includes('--git-hook'))
  assert.ok(call.args.includes('--include-metadata'))
  assert.ok(call.args.includes('--null'))
  assert.equal(call.args[call.args.indexOf('--file-list') + 1], '-')
  assert.equal(call.args[call.args.indexOf('--output-format') + 1], 'json')
  assert.deepEqual(call.args.slice(-2), [base, head])
  assert.ok(call.input.endsWith('\0'), 'file list must terminate with NUL')
  assert.deepEqual(call.input.slice(0, -1).split('\0').sort(), [...paths].sort())
}

test('parseUpdates retains every exact OID and rejects malformed updates', () => {
  const head = 'a'.repeat(40)
  const base = 'b'.repeat(40)
  assert.deepEqual(parseUpdates(update(head, base) + update(zero, base, 'removed')), [
    { localRef: 'refs/heads/feature', localOid: head, remoteRef: 'refs/heads/feature', remoteOid: base },
    { localRef: 'refs/heads/removed', localOid: zero, remoteRef: 'refs/heads/removed', remoteOid: base },
  ])
  assert.deepEqual(parseUpdates(''), [])
  assert.equal(parseUpdates(update('c'.repeat(64), 'd'.repeat(64)))[0].localOid.length, 64)
  for (const input of ['main HEAD main HEAD\n', update(head, base) + 'truncated\n', update(head, base) + 'extra fields\n']) {
    assert.throws(() => parseUpdates(input), /Invalid Git pre-push input/)
  }
})

test('only generated artifacts are excluded; generators, tests and fixtures remain', () => {
  assert.deepEqual(includedFiles([...generatedFiles, ...retainedFiles]), retainedFiles)
})

test('valid reports distinguish checked code from unsupported file changes', () => {
  assert.deepEqual(validateReport(JSON.stringify(report())), { checked: 1, total: 1 })
  assert.deepEqual(validateReport(JSON.stringify(report({
    status: 'no-applicable-changes',
    'code-health-eligible-file-count': 0,
    'checked-file-count': 0,
  }))), { checked: 0, total: 1 })
})

test('malformed, incomplete and contradictory analysis reports never approve a push', () => {
  const invalid = [
    '{invalid json', 'null', '{}', JSON.stringify({ results: [] }),
    JSON.stringify({ ...report(), results: {} }),
    JSON.stringify(report({ 'checked-file-count': '1' })),
    JSON.stringify(report({ 'checked-file-count': -1 })),
    JSON.stringify(report({ 'checked-file-count': 0.5 })),
    JSON.stringify(report({ 'checked-file-count': 0 })),
    JSON.stringify(report({ 'checked-file-count': 2 })),
    JSON.stringify(report({ 'code-health-eligible-file-count': 2, 'checked-file-count': 2 })),
    JSON.stringify(report({ 'total-modified-file-count': 0 })),
    JSON.stringify(report({ status: 'unknown' })),
    JSON.stringify(report({ status: 'no-applicable-changes' })),
    JSON.stringify(report({ 'code-health-eligible-file-count': 0, 'checked-file-count': 0 })),
    JSON.stringify(report({ status: 'issues-found' })),
    JSON.stringify(report({}, [{ 'new-code-smells': ['Complex Method'] }])),
  ]
  for (const output of invalid) assert.throws(() => validateReport(output), undefined, output)
})

test('pre-push checks all commits at supplied OIDs without touching another dirty checkout', (t) => {
  const repo = fixture(t)
  repo.git('checkout', '--quiet', '-b', 'feature')
  repo.commit({ 'src/first.ts': 'export const first = 2\n' })
  const head = repo.commit({ 'src/second.ts': 'export const second = 2\n' })
  repo.git('checkout', '--quiet', 'main')
  const checkout = repo.commit({ 'src/unrelated.ts': 'export const unrelated = true\n' })
  repo.write('src/first.ts', 'dirty local edit\n')
  repo.write('src/untracked.ts', 'untracked local edit\n')
  const before = repo.git('status', '--porcelain')
  const result = repo.invoke(['origin', 'unused-local-url'], update(head, repo.base))
  assert.equal(result.status, 0, result.stderr)
  assert.equal(repo.calls().length, 1)
  assertCall(repo.calls()[0], repo.base, head, ['src/first.ts', 'src/second.ts'])
  assert.equal(repo.git('rev-parse', 'HEAD'), checkout)
  assert.equal(repo.git('status', '--porcelain'), before)
  assert.equal(readFileSync(join(repo.cwd, 'src/first.ts'), 'utf8'), 'dirty local edit\n')
})

test('each updated ref gets its own comparison, including a deletion between updates', (t) => {
  const repo = fixture(t)
  const first = repo.commit({ 'src/first.ts': 'export const first = 2\n' })
  const second = repo.commit({ 'src/second.ts': 'export const second = 3\n' })
  const input = update(first, repo.base, 'one') + update(zero, repo.base, 'removed') + update(second, first, 'two')
  const result = repo.invoke(['origin', 'unused-local-url'], input)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(repo.calls().length, 2)
  assertCall(repo.calls()[0], repo.base, first, ['src/first.ts'])
  assertCall(repo.calls()[1], first, second, ['src/second.ts'])
})

test('a consistent report covering fewer files than requested blocks the push', (t) => {
  const repo = fixture(t)
  const head = repo.commit({ 'src/first.ts': 'export const first = 2\n', 'src/second.ts': 'export const second = 3\n' })
  repo.configure({ report: report() })
  const result = repo.invoke(['origin', 'unused-local-url'], update(head, repo.base))
  assert.equal(result.status, 1, result.stderr)
  assert.match(result.stderr, /requested file list/)
})

test('new branches use the merge-base with the named remote main', (t) => {
  const repo = fixture(t)
  repo.git('checkout', '--quiet', '-b', 'feature')
  const head = repo.commit({ 'src/feature.ts': 'export const feature = true\n' })
  repo.git('checkout', '--quiet', 'main')
  const remoteMain = repo.commit({ 'src/main-only.ts': 'export const main = true\n' })
  repo.git('update-ref', 'refs/remotes/upstream/main', remoteMain)
  const result = repo.invoke(['upstream', 'unused-local-url'], update(head, zero))
  assert.equal(result.status, 0, result.stderr)
  assertCall(repo.calls()[0], repo.base, head, ['src/feature.ts'])
})

test('missing previous tips and missing new-branch baselines block without calling CodeScene', (t) => {
  const repo = fixture(t)
  const head = repo.commit({ 'src/first.ts': 'export const first = 2\n' })
  for (const base of ['f'.repeat(40), zero]) {
    const result = repo.invoke(['origin', 'unused-local-url'], update(head, base))
    assert.equal(result.status, 1, result.stderr)
    assert.match(result.stderr, /Comparison commit is unavailable/)
  }
  assert.deepEqual(repo.calls(), [])
})

test('deleted refs and empty updates need no baseline or CodeScene execution', (t) => {
  const repo = fixture(t)
  for (const input of ['', update(zero, 'f'.repeat(40))]) {
    const result = repo.invoke(['origin', 'unused-local-url'], input)
    assert.equal(result.status, 0, result.stderr)
  }
  assert.deepEqual(repo.calls(), [])
})

test('generated-only changes skip all four exclusions', (t) => {
  const repo = fixture(t)
  const head = repo.commit(Object.fromEntries(generatedFiles.map((path) => [path, 'generated\n'])))
  const result = repo.invoke(['--check', repo.base, head])
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(repo.calls(), [])
})

test('mixed changes retain source generators, tests and fixtures in the CLI file list', (t) => {
  const repo = fixture(t)
  const head = repo.commit(Object.fromEntries([...generatedFiles, ...retainedFiles].map((path) => [path, 'content\n'])))
  const result = repo.invoke(['--check', repo.base, head])
  assert.equal(result.status, 0, result.stderr)
  assertCall(repo.calls()[0], repo.base, head, retainedFiles)
})

test('spaces, Unicode, tabs and newlines survive NUL-delimited filename transport', (t) => {
  const repo = fixture(t)
  const paths = ['src/ação com espaço.ts', 'src/line\nbreak.ts', 'src/tab\tname.ts']
  const head = repo.commit(Object.fromEntries(paths.map((path) => [path, 'export const value = 1\n'])))
  const result = repo.invoke(['--check', repo.base, head])
  assert.equal(result.status, 0, result.stderr)
  assertCall(repo.calls()[0], repo.base, head, paths)
})

test('new findings block even when the CLI exits successfully', (t) => {
  const repo = fixture(t)
  const head = repo.commit({ 'src/first.ts': 'export const first = 2\n' })
  for (const exitCode of [0, 1]) {
    repo.configure({ exitCode, report: report({ status: 'issues-found' }, [{ 'new-code-smells': ['Complex Method'] }]) })
    const result = repo.invoke(['--check', repo.base, head])
    assert.equal(result.status, 1, result.stderr)
    assert.match(result.stderr, /new Code Health issues/)
  }
})

test('CLI failures and untrustworthy reports block the actual pre-push entry point', (t) => {
  const repo = fixture(t)
  const head = repo.commit({ 'src/first.ts': 'export const first = 2\n' })
  const failures = [
    { exitCode: 2 },
    { exitCode: 1 },
    { signal: 'SIGTERM' },
    { output: '' },
    { output: '{invalid json' },
    { output: '{}' },
    { report: report({ 'checked-file-count': 0 }) },
    { report: report({ status: 'unexpected' }) },
  ]
  for (const failure of failures) {
    repo.configure(failure)
    const result = repo.invoke(['origin', 'unused-local-url'], update(head, repo.base))
    assert.equal(result.status, 1, JSON.stringify({ failure, stderr: result.stderr }))
  }
  const missing = repo.invoke(['--check', repo.base, head], '', { METIS_CODESCENE_BIN: join(repo.cwd, 'missing-cli') })
  assert.equal(missing.status, 1, missing.stderr)
  assert.match(missing.stderr, /could not complete the analysis/)
})

test('setup is idempotent and configures only the disposable clone', (t) => {
  const repo = fixture(t)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = repo.invoke(['--install'])
    assert.equal(result.status, 0, result.stderr)
    assert.equal(repo.git('config', '--local', '--get-all', 'core.hooksPath'), '.githooks')
  }
  assert.equal(existsSync(repo.env.GIT_CONFIG_GLOBAL), false)
})

test('setup preserves existing Git hooks, including hooks unrelated to pre-push', (t) => {
  const repo = fixture(t)
  const path = join(repo.cwd, '.git/hooks/pre-commit')
  const contents = '#!/bin/sh\nexit 0\n'
  writeFileSync(path, contents, { mode: 0o755 })
  const result = repo.invoke(['--install'])
  assert.equal(result.status, 1, result.stderr)
  assert.match(result.stderr, /Preserving existing Git hook pre-commit/)
  assert.equal(readFileSync(path, 'utf8'), contents)
  assert.doesNotMatch(repo.git('config', '--local', '--list'), /core\.hookspath=/)
})

test('setup preserves a configured hooks path and its existing hook', (t) => {
  const repo = fixture(t)
  const directory = 'custom hooks'
  repo.git('config', '--local', 'core.hooksPath', directory)
  repo.write(`${directory}/pre-push`, '#!/bin/sh\nexit 7\n')
  const result = repo.invoke(['--install'])
  assert.equal(result.status, 1, result.stderr)
  assert.match(result.stderr, /Preserving existing core.hooksPath/)
  assert.equal(repo.git('config', '--local', '--get', 'core.hooksPath'), directory)
  assert.equal(readFileSync(join(repo.cwd, directory, 'pre-push'), 'utf8'), '#!/bin/sh\nexit 7\n')
})
