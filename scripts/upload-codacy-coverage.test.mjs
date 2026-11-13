import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('./upload-codacy-coverage.sh', import.meta.url))

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'metis-codacy-upload-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const bin = join(dir, 'bin')
  mkdirSync(bin)
  for (const scope of ['frontend', 'server']) {
    mkdirSync(join(dir, 'coverage', scope), { recursive: true })
    writeFileSync(join(dir, 'coverage', scope, 'lcov.info'), 'SF:src/example.ts\nDA:1,1\nend_of_record\n')
  }
  const marker = join(dir, 'download-called')
  writeFileSync(join(bin, 'curl'), `#!/bin/sh
echo called > "$CODACY_TEST_MARKER"
if [ "$CODACY_TEST_MODE" = failure ]; then exit 6; fi
for last; do :; done
printf 'exit 0\n' > "$last"
`, { mode: 0o755 })
  const invoke = (mode, token = 'disposable-test-value') => spawnSync('bash', [script], {
    cwd: dir,
    encoding: 'utf8',
    env: {
      PATH: `${bin}:${process.env.PATH}`,
      CODACY_PROJECT_TOKEN: token,
      CODACY_TEST_MARKER: marker,
      CODACY_TEST_MODE: mode,
    },
  })
  return { dir, marker, invoke }
}

test('failed helper download blocks the upload instead of succeeding with an empty script', (t) => {
  const { marker, invoke } = fixture(t)
  const result = invoke('failure')
  assert.equal(result.status, 6, result.stderr)
  assert.equal(readFileSync(marker, 'utf8').trim(), 'called')
})

test('a modified helper fails checksum verification', (t) => {
  const { invoke } = fixture(t)
  const result = invoke('corrupt')
  assert.notEqual(result.status, 0)
  assert.match(result.stdout + result.stderr, /FAILED|checksum/)
})

test('missing credentials or a missing report fail before any download', (t) => {
  const { dir, marker, invoke } = fixture(t)
  assert.notEqual(invoke('failure', '').status, 0)
  assert.equal(existsSync(marker), false)
  rmSync(join(dir, 'coverage/server/lcov.info'))
  const result = invoke('failure')
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Missing coverage report/)
  assert.equal(existsSync(marker), false)
})
