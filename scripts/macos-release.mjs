import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { closeSync, existsSync, mkdtempSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { parseEnv } from 'node:util'

const ROOT = path.resolve(import.meta.dirname, '..')
const TEAM = 'C42XKG5G6X'
const IDENTITY = `Developer ID Application: Popcode (${TEAM})`
const CONFIG = 'src-tauri/tauri.macos-release.conf.json'
const TARGET = 'aarch64-apple-darwin'
const REPO = 'hdoria/metis'
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/
const SHA = /^[a-f0-9]{40}$/
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i
const ensure = (condition, message) => { if (!condition) throw new Error(`macos-release: ${message}`) }
const json = (file) => JSON.parse(readFileSync(file, 'utf8'))
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
export const hashFile = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')

export function parseArgs(args) {
  const [command, tag] = args
  ensure(args.length === 2 && ['plan', 'build', 'draft'].includes(command) && typeof tag === 'string' && tag.startsWith('v') && SEMVER.test(tag.slice(1)), 'usage: node scripts/macos-release.mjs plan|build|draft <vSEMVER>')
  return { command, tag, version: tag.slice(1) }
}

export function releasePaths(tag, sha) {
  parseArgs(['plan', tag])
  ensure(SHA.test(sha), 'source SHA must contain 40 lowercase hexadecimal characters')
  return { outputDir: `src-tauri/target/metis-release/${tag}-${sha.slice(0, 12)}` }
}

export function checkVersions(expected, ...versions) {
  ensure(versions.length === 3 && versions.every((version) => version === expected), 'tag must match package.json, Tauri, and Cargo package versions')
}

// Never expose child-process output in an error: Apple and Sentry may include credentials.
function signatureOutput(execute, file, args, options) {
  const directory = mkdtempSync(path.join(tmpdir(), 'metis-signature-'))
  const stderrPath = path.join(directory, 'stderr')
  const stderr = openSync(stderrPath, 'wx', 0o600)
  try {
    const stdout = execute(file, args, { ...options, stdio: ['ignore', 'pipe', stderr] })
    return `${stdout}${readFileSync(stderrPath, 'utf8')}`
  } finally {
    closeSync(stderr)
    rmSync(directory, { recursive: true, force: true })
  }
}

const reportPhase = (phase) => process.stderr.write(`macos-release: ${phase}\n`)
export function runner(root = ROOT, env = process.env, execute = execFileSync, report = reportPhase) {
  return (file, args, phase, childEnv = env) => {
    ensure(/^[a-z][a-z0-9-]*$/.test(phase), 'invalid command phase')
    report(phase)
    const options = { cwd: root, env: childEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }
    try {
      if (file === 'codesign' && args.includes('--display')) return signatureOutput(execute, file, args, options).trim()
      return execute(file, args, options).trim()
    } catch { throw new Error(`macos-release: ${phase} failed`) }
  }
}

export function createPlan(tag, { root = ROOT, run = runner(root) } = {}) {
  const { version } = parseArgs(['plan', tag])
  ensure(!run('git', ['status', '--porcelain=v1', '--untracked-files=normal'], 'source-clean'), 'source checkout must be clean')
  const sha = run('git', ['rev-parse', '--verify', 'HEAD'], 'source-sha')
  if (run('git', ['tag', '--list', tag], 'source-tag')) ensure(run('git', ['rev-parse', '--verify', `${tag}^{commit}`], 'source-tag-sha') === sha, 'existing tag must point at source HEAD')
  const cargo = readFileSync(path.join(root, 'src-tauri/Cargo.toml'), 'utf8').split(/^\[/m).find((section) => section.startsWith('package]'))
  checkVersions(version, json(path.join(root, 'package.json')).version, json(path.join(root, 'src-tauri/tauri.conf.json')).version, /^version\s*=\s*"([^"]+)"/m.exec(cargo ?? '')?.[1])
  return { tag, version, sha, target: TARGET, ...releasePaths(tag, sha) }
}

export function buildEnvironment(env, plan) {
  const result = { ...env }
  for (const key of Object.keys(result)) if (key.startsWith('APPLE_') || key === 'SENTRY_AUTH_TOKEN') delete result[key]
  const coreVersion = /^\d+\.\d+\.\d+/.exec(plan.version)[0]
  const qualifier = plan.version.slice(coreVersion.length).replace(/^[-+]/, '').replaceAll('+', '.')
  const buildId = [qualifier, plan.sha.slice(0, 12)].filter(Boolean).join('.')
  return { ...result, TAURI_PLATFORM: 'macos', NODE_ENV: 'production', VITE_SENTRY_RELEASE: `metis-desktop@${coreVersion}+${buildId}`, SENTRY_RELEASE: `metis-native@${coreVersion}+${buildId}`, VITE_SENTRY_ENVIRONMENT: 'production', SENTRY_ENVIRONMENT: 'production' }
}

function privateEnvironment(env) {
  const result = { ...env }
  if (!env.GITHUB_ACTIONS) {
    for (const [relative, keys] of [
      ['observability/sentry.env', ['VITE_SENTRY_DSN', 'SENTRY_DSN', 'SENTRY_ORG', 'SENTRY_FRONTEND_PROJECT', 'SENTRY_NATIVE_PROJECT']],
      ['licensing/tldraw.env', ['VITE_TLDRAW_LICENSE_KEY']],
    ]) {
      const values = parseEnv(readFileSync(path.join(homedir(), '.config/metis', relative), 'utf8'))
      for (const key of keys) if (values[key]) result[key] = values[key]
    }
  }
  for (const key of ['VITE_SENTRY_DSN', 'SENTRY_DSN', 'VITE_TLDRAW_LICENSE_KEY']) ensure(Boolean(result[key]?.trim()), `missing ${key}`)
  ensure(result.SENTRY_ORG === 'popcode' && result.SENTRY_FRONTEND_PROJECT === 'metis-desktop' && result.SENTRY_NATIVE_PROJECT === 'metis-native', 'Sentry must use the configured Popcode desktop and native projects')
  return result
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => {
    const full = path.join(directory, entry.name)
    return entry.isDirectory() ? files(full) : [full]
  })
}
const noMaps = (directory) => ensure(!files(directory).some((file) => file.endsWith('.map')), 'source maps must not ship')
const hashTree = (directory) => createHash('sha256').update(files(directory).map((file) => `${path.relative(directory, file)}\0${hashFile(file)}`).join('\n')).digest('hex')
const binary = (app) => path.join(app, 'Contents/MacOS/metis')

function verifyApp(app, { plan, run, root }) {
  const info = JSON.parse(run('plutil', ['-convert', 'json', '-o', '-', path.join(app, 'Contents/Info.plist')], 'app-info'))
  ensure(info.CFBundleIdentifier === 'io.github.hdoria.metis', 'application identifier mismatch')
  ensure(info.CFBundleShortVersionString === plan.version, 'application version mismatch')
  ensure(info.CFBundleExecutable === 'metis', 'application executable mismatch')
  ensure(run('lipo', ['-archs', binary(app)], 'app-architecture') === 'arm64', 'application must contain arm64 only')
  const signature = run('codesign', ['--display', '--verbose=4', app], 'app-signature')
  ensure(signature.includes(`TeamIdentifier=${TEAM}`) && /flags=.*\bruntime\b/.test(signature), 'application must use the Popcode team and hardened runtime')
  run('codesign', ['--verify', '--deep', '--strict', '--verbose=2', app], 'app-signature-verify')
  const resources = path.join(app, 'Contents/Resources')
  for (const name of ['mcp-server/index.js', 'mcp-server/ws-bridge.js', 'mcp-server/package.json', 'agent-docs/index.md', 'agent-docs/all.md', 'agent-docs/search-index.json']) ensure(existsSync(path.join(resources, name)), 'required bundled resources missing')
  ensure(readdirSync(path.join(resources, 'agent-docs/pages')).length > 0, 'agent documentation pages missing')
  for (const [bundled, source] of [['legal/creditos.html', 'site/landing/public/creditos.html'], ['legal/LICENSE.txt', 'LICENSE']]) ensure(hashFile(path.join(resources, bundled)) === hashFile(path.join(root, source)), 'bundled legal notices differ from source')
  noMaps(app)
}

function normalizeDebugId(value) {
  ensure(typeof value === 'string', 'native symbol debug ID missing')
  ensure(/^(?:[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}|[a-f0-9]{32})(?:-0)?$/i.test(value), 'invalid native symbol debug ID')
  return value.replace(/-0$/, '').replaceAll('-', '').toLowerCase()
}

function validateSymbolEntry(entry, expectedUUID) {
  ensure(Boolean(entry), 'required native symbol artifact missing')
  ensure(entry.state === 'ok', 'native symbol artifact processing incomplete')
  ensure(normalizeDebugId(entry.debugId) === expectedUUID, 'native symbol artifact UUID mismatch')
}

export function validateNativeSymbols(upload, expectedUUID) {
  ensure(upload.uploaded === true, 'native symbols were not uploaded')
  ensure(upload.org === 'popcode', 'native symbol organization mismatch')
  ensure(upload.project === 'metis-native', 'native symbol project mismatch')
  ensure(Number.isInteger(upload.filesUploaded), 'invalid native symbol upload count')
  ensure(upload.filesUploaded >= 2, 'native symbol upload missing executable or sources')
  ensure(Array.isArray(upload.files), 'native symbol artifacts missing')
  const uuid = normalizeDebugId(expectedUUID)
  validateSymbolEntry(upload.files.find((file) => file?.name === 'metis'), uuid)
  validateSymbolEntry(upload.files.find((file) => typeof file?.name === 'string' && file.name.endsWith('.src.zip')), uuid)
  return upload
}

export function matchingDsym(root, executable, run) {
  const uuids = (file) => run('xcrun', ['dwarfdump', '--uuid', file], 'debug-uuid').split('\n').map((line) => /^UUID: ([A-Fa-f0-9-]+) \(arm64\)/.exec(line)?.[1]?.toUpperCase()).filter(Boolean).sort().join(',')
  const expected = uuids(executable)
  ensure(UUID.test(expected), 'single executable debug UUID required')
  const build = path.join(root, 'src-tauri/target/release/build')
  const candidates = readdirSync(build).filter((name) => name === 'metis' || name.startsWith('metis-')).flatMap((name) => files(path.join(build, name))).filter((file) => file.endsWith('/metis.dSYM/Contents/Resources/DWARF/metis'))
  const match = candidates.find((file) => uuids(file) === expected)
  ensure(match, 'matching metis.dSYM not found')
  return { directory: match.slice(0, -'/Contents/Resources/DWARF/metis'.length), uuid: expected }
}

function notaryAuth(env) {
  const profile = env.METIS_NOTARY_PROFILE || 'metis-popcode'
  return ['--keychain-profile', profile, ...(env.METIS_NOTARY_KEYCHAIN ? ['--keychain', env.METIS_NOTARY_KEYCHAIN] : [])]
}

function saveNotaryLog(id, label, context) {
  const { directory, notary: env, run } = context
  const log = JSON.parse(run('xcrun', ['notarytool', 'log', id, ...notaryAuth(env), '--output-format', 'json'], `${label}-notary-log`, env))
  writeJson(path.join(directory, `${label}-notary-log.json`), { jobId: id, status: log.status, statusCode: log.statusCode, issues: (log.issues ?? []).map(({ severity, code }) => ({ severity, code })) })
}

export function notarize(file, label, context) {
  const { directory, notary: env, run } = context
  const auth = notaryAuth(env)
  const submission = JSON.parse(run('xcrun', ['notarytool', 'submit', file, ...auth, '--no-wait', '--output-format', 'json'], `${label}-notarization-submit`, env))
  ensure(UUID.test(submission.id ?? ''), `${label} notarization returned no submission ID`)
  const receipt = path.join(directory, `${label}-notary.json`)
  writeJson(receipt, { id: submission.id, status: submission.status })
  const result = JSON.parse(run('xcrun', ['notarytool', 'wait', submission.id, ...auth, '--timeout', '30m', '--output-format', 'json'], `${label}-notarization-wait`, env))
  writeJson(receipt, { id: submission.id, status: result.status })
  saveNotaryLog(submission.id, label, context)
  ensure(result.status === 'Accepted', `${label} notarization was not accepted`)
  return submission.id
}

const staple = (file, run, env) => {
  run('xcrun', ['stapler', 'staple', file], 'staple', env)
  run('xcrun', ['stapler', 'validate', file], 'staple-validate', env)
}

function releaseContext(plan, { root = ROOT, env = process.env, run = runner(root, env) }) {
  ensure(process.platform === 'darwin' && process.arch === 'arm64', 'build requires an Apple Silicon macOS host')
  ensure(Number(process.versions.node.split('.')[0]) === 26, 'build requires Node 26')
  const secrets = privateEnvironment(env)
  const compile = buildEnvironment(secrets, plan)
  const directory = path.join(root, plan.outputDir)
  ensure(!existsSync(directory), 'release output already exists; preserve it or remove it explicitly before rebuilding')
  // Signing uses the imported/existing keychain; Tauri never receives notarization credentials.
  return { plan, root, run, directory, secrets, compile,
    signing: { ...compile, APPLE_SIGNING_IDENTITY: IDENTITY },
    notary: { ...compile, METIS_NOTARY_PROFILE: env.METIS_NOTARY_PROFILE, METIS_NOTARY_KEYCHAIN: env.METIS_NOTARY_KEYCHAIN },
  }
}

function buildFrontend({ root, run, secrets, compile }) {
  const dist = path.join(root, 'dist')
  rmSync(dist, { recursive: true, force: true })
  run('pnpm', ['exec', 'tsc', '-b'], 'typescript-build', compile)
  run('pnpm', ['exec', 'vite', 'build', '--sourcemap', 'hidden'], 'frontend-build', compile)
  run('sentry', ['sourcemap', 'upload', 'dist', '--release', compile.VITE_SENTRY_RELEASE, '--json'], 'frontend-symbol-upload', { ...secrets, SENTRY_ORG: 'popcode', SENTRY_PROJECT: 'metis-desktop' })
  for (const file of files(dist)) if (file.endsWith('.map')) rmSync(file)
  noMaps(dist)
  return { dist, hash: hashTree(dist) }
}

function ensureFrontendUnchanged(frontend) {
  ensure(hashTree(frontend.dist) === frontend.hash, 'frontend changed during native build or bundling')
  noMaps(frontend.dist)
}

function buildNative(context, frontend) {
  const { root, run, secrets, compile, signing } = context
  run('pnpm', ['tauri', 'build', '--no-bundle', '--config', CONFIG, '--', '--locked'], 'native-build', compile)
  ensureFrontendUnchanged(frontend)
  const dsym = matchingDsym(root, path.join(root, 'src-tauri/target/release/metis'), run)
  const upload = JSON.parse(run('sentry', ['debug-files', 'upload', dsym.directory, '--include-sources', '--wait', '--json'], 'native-symbol-upload', { ...secrets, SENTRY_ORG: 'popcode', SENTRY_PROJECT: 'metis-native' }))
  validateNativeSymbols(upload, dsym.uuid)
  run('pnpm', ['tauri', 'bundle', '--bundles', 'app', '--config', CONFIG], 'app-bundle', signing)
  ensureFrontendUnchanged(frontend)
}

function notarizeApp(context) {
  const { root, directory, run, notary } = context
  const app = path.join(directory, 'Métis.app')
  run('ditto', [path.join(root, 'src-tauri/target/release/bundle/macos/Métis.app'), app], 'app-copy', notary)
  verifyApp(app, context)
  const zip = path.join(directory, 'Metis-notarization.zip')
  run('ditto', ['-c', '-k', '--keepParent', '--sequesterRsrc', app, zip], 'app-notary-archive', notary)
  const id = notarize(zip, 'app', context)
  staple(app, run, notary)
  return { app, id }
}

function createDmg(app, { directory, plan, run, notary }) {
  const stage = path.join(directory, 'dmg-stage')
  mkdirSync(stage)
  run('ditto', [app, path.join(stage, 'Métis.app')], 'dmg-stage-app', notary)
  symlinkSync('/Applications', path.join(stage, 'Applications'))
  const dmg = path.join(directory, `Metis_${plan.version}_aarch64.dmg`)
  run('hdiutil', ['create', '-volname', 'Métis', '-srcfolder', stage, '-format', 'UDZO', '-ov', dmg], 'dmg-create', notary)
  run('codesign', ['--sign', IDENTITY, '--timestamp', dmg], 'dmg-sign', notary)
  return dmg
}

function assessArtifacts(app, dmg, { run, notary }) {
  run('hdiutil', ['verify', dmg], 'dmg-verify', notary)
  run('spctl', ['--assess', '--type', 'execute', '--verbose=2', app], 'app-gatekeeper', notary)
  run('spctl', ['--assess', '--type', 'open', '--context', 'context:primary-signature', '--verbose=2', dmg], 'dmg-gatekeeper', notary)
}

function writeManifest(context, dmg, notarization) {
  const { plan, directory } = context
  const manifest = { tag: plan.tag, version: plan.version, sourceSHA: plan.sha, target: TARGET, architecture: 'arm64', teamIdentifier: TEAM, dmg: { file: path.basename(dmg), sha256: hashFile(dmg) }, notarization }
  validateManifest(manifest, plan)
  writeJson(path.join(directory, 'manifest.json'), manifest)
  writeFileSync(path.join(directory, 'SHA256SUMS'), `${manifest.dmg.sha256}  ${manifest.dmg.file}\n${hashFile(path.join(directory, 'manifest.json'))}  manifest.json\n`)
  return manifest
}

export function buildRelease(plan, options = {}) {
  const context = releaseContext(plan, options)
  ensure(context.run('sentry', ['--version'], 'sentry-version') === '0.49.0', 'Sentry CLI 0.49.0 required')
  context.run('rustc', ['--version'], 'rust-version')
  mkdirSync(context.directory, { recursive: true })
  buildNative(context, buildFrontend(context))
  const { app, id: appId } = notarizeApp(context)
  const dmg = createDmg(app, context)
  const dmgId = notarize(dmg, 'dmg', context)
  staple(dmg, context.run, context.notary)
  assessArtifacts(app, dmg, context)
  verifyMountedDmg(dmg, app, context)
  return writeManifest(context, dmg, { app: appId, dmg: dmgId })
}

function verifyMountedDmg(dmg, app, context) {
  const { directory, run, notary: env } = context
  const mount = path.join(directory, 'mounted-dmg')
  mkdirSync(mount)
  let attached = false
  try {
    const plist = run('hdiutil', ['attach', '-readonly', '-nobrowse', '-plist', '-mountpoint', mount, dmg], 'dmg-mount', env)
    attached = true
    const attachFile = path.join(directory, 'dmg-attach.plist')
    writeFileSync(attachFile, plist)
    const info = JSON.parse(run('plutil', ['-convert', 'json', '-o', '-', attachFile], 'dmg-mount-info', env))
    ensure(info['system-entities']?.some((entity) => entity['mount-point'] === mount), 'DMG did not mount at expected directory')
    const payload = path.join(mount, 'Métis.app')
    ensure(hashFile(binary(payload)) === hashFile(binary(app)), 'DMG executable differs from notarized application')
    verifyApp(payload, context)
    run('xcrun', ['stapler', 'validate', payload], 'dmg-payload-ticket', env)
  } finally {
    if (attached) run('hdiutil', ['detach', mount], 'dmg-detach', env)
  }
}

function ensureFields(value, fields) {
  ensure(Object.keys(value).sort().join(',') === [...fields].sort().join(','), 'unexpected manifest fields')
}

function validateInstaller(dmg, version) {
  ensureFields(dmg, ['file', 'sha256'])
  ensure(dmg.file === `Metis_${version}_aarch64.dmg`, 'invalid manifest installer filename')
  ensure(/^[a-f0-9]{64}$/.test(dmg.sha256), 'invalid manifest installer checksum')
}

function validateNotarization(notarization) {
  ensureFields(notarization, ['app', 'dmg'])
  ensure(UUID.test(notarization.app), 'invalid application notarization ID')
  ensure(UUID.test(notarization.dmg), 'invalid disk image notarization ID')
}

export function validateManifest(manifest, plan) {
  ensureFields(manifest, ['tag', 'version', 'sourceSHA', 'target', 'architecture', 'teamIdentifier', 'dmg', 'notarization'])
  ensure(manifest.tag === plan.tag, 'manifest tag mismatch')
  ensure(manifest.version === plan.version, 'manifest version mismatch')
  ensure(manifest.sourceSHA === plan.sha, 'manifest source mismatch')
  ensure(manifest.target === TARGET, 'manifest target mismatch')
  ensure(manifest.architecture === 'arm64', 'manifest architecture mismatch')
  ensure(manifest.teamIdentifier === TEAM, 'manifest signing team mismatch')
  validateInstaller(manifest.dmg, plan.version)
  validateNotarization(manifest.notarization)
}

export function validateDraft(release, plan) {
  ensure(release.isDraft === true && release.tagName === plan.tag && release.targetCommitish === plan.sha, 'existing release must be a draft targeting the exact source SHA')
}

export function draftRelease(plan, { root = ROOT, run = runner(root) } = {}) {
  const directory = path.join(root, plan.outputDir)
  const manifest = json(path.join(directory, 'manifest.json'))
  validateManifest(manifest, plan)
  ensure(hashFile(path.join(directory, manifest.dmg.file)) === manifest.dmg.sha256, 'installer checksum mismatch')
  const checksums = `${manifest.dmg.sha256}  ${manifest.dmg.file}\n${hashFile(path.join(directory, 'manifest.json'))}  manifest.json\n`
  ensure(readFileSync(path.join(directory, 'SHA256SUMS'), 'utf8') === checksums, 'SHA256SUMS mismatch')
  run('git', ['merge-base', '--is-ancestor', plan.sha, 'origin/main'], 'source-on-main')
  ensure(run('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'], 'github-repository') === REPO, 'GitHub repository must be hdoria/metis')
  const ci = JSON.parse(run('gh', ['run', 'list', '--repo', REPO, '--workflow', 'ci.yml', '--commit', plan.sha, '--status', 'success', '--limit', '100', '--json', 'headSha,conclusion'], 'ci-gate'))
  ensure(ci.some((run) => run.headSha === plan.sha && run.conclusion === 'success'), 'successful ci.yml run required for the exact source SHA')
  const releases = JSON.parse(run('gh', ['release', 'list', '--repo', REPO, '--limit', '1000', '--json', 'tagName,isDraft'], 'release-list'))
  const existing = releases.find((release) => release.tagName === plan.tag)
  if (existing) validateDraft(JSON.parse(run('gh', ['release', 'view', plan.tag, '--repo', REPO, '--json', 'tagName,isDraft,targetCommitish'], 'release-check')), plan)
  const notes = path.join(directory, 'release-notes.md')
  writeFileSync(notes, `Apple Silicon macOS installer for Métis ${plan.version}.\n\nSource commit: ${plan.sha}\nArchitecture: arm64\nSigning team: ${TEAM}\nApple notarization: accepted for the application and disk image.\n\nInstall: open the DMG and drag Métis into Applications.\nChecksums and provenance are attached in SHA256SUMS and manifest.json.\n`)
  if (!existing) run('gh', ['release', 'create', plan.tag, '--repo', REPO, '--draft', '--target', plan.sha, '--title', `Métis ${plan.version} (macOS Apple Silicon)`, '--notes-file', notes], 'draft-create')
  // Recheck after creation and immediately before replacement of any attachments.
  validateDraft(JSON.parse(run('gh', ['release', 'view', plan.tag, '--repo', REPO, '--json', 'tagName,isDraft,targetCommitish'], 'draft-recheck')), plan)
  run('gh', ['release', 'upload', plan.tag, ...[manifest.dmg.file, 'manifest.json', 'SHA256SUMS'].map((name) => path.join(directory, name)), '--repo', REPO, '--clobber'], 'draft-upload')
}

if (process.argv[1] === import.meta.filename) {
  try {
    const { command, tag } = parseArgs(process.argv.slice(2))
    const plan = createPlan(tag)
    if (command === 'build') buildRelease(plan)
    if (command === 'draft') draftRelease(plan)
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`)
  } catch (error) {
    // Filesystem/JSON errors can include private paths; only emit our own vetted diagnostics.
    process.stderr.write(`${error.message?.startsWith('macos-release:') ? error.message : 'macos-release: operation failed'}\n`)
    process.exitCode = 1
  }
}
