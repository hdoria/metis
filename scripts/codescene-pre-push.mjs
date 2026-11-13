import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const config = JSON.parse(readFileSync(new URL('../codescene.config.json', import.meta.url), 'utf8'))
const zeroOid = /^0+$/
const oidPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    timeout: 600_000,
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  })
}

function git(args, options) {
  const result = run('git', args, options)
  if (result.status !== 0) throw new Error(`Git could not run ${args[0]}. Fetch the remote history and retry.`)
  return result.stdout.trimEnd()
}

function commit(ref) {
  const result = run('git', ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`])
  const valid = result.status === 0 && oidPattern.test(result.stdout.trim())
  if (!valid) {
    throw new Error(`Comparison commit is unavailable: ${JSON.stringify(ref)}. Fetch the remote history and retry.`)
  }
  return result.stdout.trim()
}

function parseUpdate(line) {
  const fields = line.trim().split(/\s+/)
  assert.equal(fields.length, 4, 'Invalid Git pre-push input; no range was approved.')
  const [localRef, localOid, remoteRef, remoteOid] = fields
  assert([localOid, remoteOid].every((oid) => oidPattern.test(oid)), 'Invalid Git pre-push input; no range was approved.')
  return { localRef, localOid, remoteRef, remoteOid }
}

export function parseUpdates(input) {
  return input.split('\n').filter(Boolean).map(parseUpdate)
}

export function includedFiles(paths) {
  return paths.filter((path) => !config.excludeFiles.includes(path)
    && !config.excludeDirectories.some((directory) => path.startsWith(directory)))
}

function fileCount(metadata, key) {
  const count = metadata[key]
  assert(Number.isInteger(count), 'CodeScene returned an incomplete report; the push was not approved.')
  assert(count >= 0, 'CodeScene returned an invalid file count; the push was not approved.')
  return count
}

function validateScope(metadata) {
  const total = fileCount(metadata, 'total-modified-file-count')
  const eligible = fileCount(metadata, 'code-health-eligible-file-count')
  const checked = fileCount(metadata, 'checked-file-count')
  const failure = 'CodeScene did not check the full eligible scope; the push was not approved.'
  assert.equal(checked, eligible, failure)
  assert(eligible <= total, failure)
  assert(total > 0, failure)
  return { checked, total }
}

export function validateReport(output) {
  const report = JSON.parse(output)
  assert(Array.isArray(report?.results), 'CodeScene returned an incomplete report; the push was not approved.')
  const scope = validateScope(report.metadata)
  if (report.results.length > 0) {
    throw new Error(`CodeScene found new Code Health issues:\n${JSON.stringify(report.results, null, 2)}`)
  }
  const expected = scope.checked === 0 ? 'no-applicable-changes' : 'no-issues-found'
  assert.equal(report.metadata.status, expected, 'CodeScene returned an unexpected analysis status; the push was not approved.')
  return scope
}

function cliPath() {
  if (process.env.METIS_CODESCENE_BIN) return process.env.METIS_CODESCENE_BIN
  const local = join(homedir(), '.local', 'bin', 'cs')
  return existsSync(local) ? local : 'cs'
}

export function checkRange(baseRef, headRef) {
  const head = commit(headRef)
  const base = commit(baseRef)
  const paths = git(['diff', '--name-only', '--no-renames', '--diff-filter=ACMT', '-z', base, head, '--'])
    .split('\0').filter(Boolean)
  const included = includedFiles(paths)
  if (included.length === 0) {
    console.error('CodeScene: no retained file changes to analyze (deleted or generated files only).')
    return
  }
  console.error(`CodeScene: checking ${base.slice(0, 8)}..${head.slice(0, 8)} (${included.length} files).`)
  const result = analyzeRange(base, head, included)
  const { checked, total } = validateReport(result.stdout)
  assert.equal(total, included.length, 'CodeScene did not analyze the requested file list; the push was not approved.')
  if (result.status !== 0) throw new Error('CodeScene exited unsuccessfully; the push was not approved.')
  console.error(`CodeScene: passed (${checked} eligible files checked).`)
}

function analyzeRange(base, head, included) {
  const result = run(cliPath(), [
    'delta', '--include-metadata', '--output-format', 'json', '--git-hook',
    '--file-list', '-', '--null', base, head,
  ], {
    input: `${included.join('\0')}\0`,
    env: { ...process.env, CS_OAUTH_CLIENT: process.env.CS_OAUTH_CLIENT ?? 'mcp', CS_DISABLE_TRACKING: '1' },
  })
  const failure = 'CodeScene could not complete the analysis. Check the CLI installation, network and authentication with cs auth status --client mcp; then retry.'
  assert(!result.error, failure)
  assert(!result.signal, failure)
  assert([0, 1].includes(result.status), failure)
  assert(result.stdout.trim(), failure)
  return result
}

function baseForNewBranch(remote, head) {
  // A new branch has no previous remote tip; compare with its shared main history.
  if (!/^[a-zA-Z0-9._-]+$/.test(remote)) throw new Error('Use a named Git remote to validate a new branch.')
  const main = commit(`refs/remotes/${remote}/${config.baseBranch}`)
  const result = run('git', ['merge-base', main, head])
  if (result.status !== 0) throw new Error('The new branch has no shared main history; establish a reviewed baseline before pushing it.')
  return result.stdout.trim()
}

export function checkPush(input, remote) {
  for (const update of parseUpdates(input)) {
    if (zeroOid.test(update.localOid)) continue
    const head = commit(update.localOid)
    const base = zeroOid.test(update.remoteOid)
      ? baseForNewBranch(remote, head)
      : commit(update.remoteOid)
    checkRange(base, head)
  }
}

function preserveExistingHooks(current) {
  if (current === '.githooks') return
  if (current) throw new Error(`Preserving existing core.hooksPath=${JSON.stringify(current)}. Integrate the CodeScene hook manually.`)
  const directory = git(['rev-parse', '--git-path', 'hooks'])
  if (!existsSync(directory)) return
  // Changing hooksPath would disable unrelated hooks; preserve all custom entries.
  const existing = readdirSync(directory).find((name) => !name.endsWith('.sample'))
  if (existing) throw new Error(`Preserving existing Git hook ${existing}. Integrate the CodeScene hook manually.`)
}

export function installHook() {
  const setting = run('git', ['config', '--get', 'core.hooksPath'])
  assert([0, 1].includes(setting.status), 'Could not inspect the existing Git hook configuration.')
  preserveExistingHooks(setting.stdout.trim())
  git(['config', '--local', 'core.hooksPath', '.githooks'])
  console.error('CodeScene pre-push hook installed for this clone. See docs/codescene.md for authentication and checks.')
}

function main() {
  const args = process.argv.slice(2)
  if (args[0] === '--install' && args.length === 1) return installHook()
  if (args[0] === '--check' && args.length === 3) return checkRange(args[1], args[2])
  if (args.length !== 2 || args[0].startsWith('-')) throw new Error('Usage: codescene-pre-push.mjs <remote> <url> | --check <base> <head> | --install')
  checkPush(readFileSync(0, 'utf8'), args[0])
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (error) {
    console.error(`CodeScene: ${error.message}`)
    process.exitCode = 1
  }
}
