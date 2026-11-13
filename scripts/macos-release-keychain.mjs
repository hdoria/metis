import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { appendFileSync, closeSync, lstatSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const safePath = (value) => typeof value === 'string' && isAbsolute(value) && !/[\r\n\0]/.test(value)
const nativeRun = (file, args) => execFileSync(file, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const failure = (stage) => new Error(`macOS release keychain: ${stage} failed`)

function pathExists(path) {
  try { lstatSync(path); return true } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

function validateInvocation(action, env) {
  if (env.GITHUB_ACTIONS !== 'true') throw failure('GitHub Actions guard')
  if (!safePath(env.RUNNER_TEMP)) throw failure('RUNNER_TEMP validation')
  if (!['setup', 'cleanup'].includes(action)) throw failure('action validation')
}

function createContext(action, env, run) {
  return {
    env, run, stage: action, ownsMetadata: false, ownsCertificate: false,
    keychain: join(env.RUNNER_TEMP, 'metis-release.keychain-db'),
    metadata: join(env.RUNNER_TEMP, 'metis-release-keychain-state.json'),
    certificate: join(env.RUNNER_TEMP, 'metis-release-certificate.p12'),
  }
}

function command(context, stage, file, args) {
  context.stage = stage
  return context.run(file, args)
}

const security = (context, stage, args) => command(context, stage, 'security', args)

function validateSearchList(list) {
  if (!Array.isArray(list) || !list.every(safePath)) throw failure('search list validation')
  return list
}

function readOriginalSearchList(context) {
  const output = security(context, 'read search list', ['list-keychains', '-d', 'user'])
  const lines = output.split('\n').map((line) => line.trim()).filter(Boolean)
  return validateSearchList(lines.map((line) => JSON.parse(line)))
}

function deleteOwnedKeychain(context) {
  if (!pathExists(context.keychain)) return
  if (lstatSync(context.keychain).isSymbolicLink()) throw failure('keychain validation')
  security(context, 'cleanup', ['delete-keychain', context.keychain])
}

function cleanupKeychain(context) {
  if (!pathExists(context.metadata)) return
  if (lstatSync(context.metadata).isSymbolicLink()) throw failure('metadata validation')
  const original = validateSearchList(JSON.parse(readFileSync(context.metadata, 'utf8')))
  let deleteFailed = false
  try { deleteOwnedKeychain(context) } catch { deleteFailed = true }
  // Deletion also changes the search list; restore afterward, even if it failed.
  security(context, 'cleanup', ['list-keychains', '-d', 'user', '-s', ...original])
  if (deleteFailed) throw failure('cleanup')
  rmSync(context.metadata)
}

function decodeCertificate(encoded) {
  const normalized = encoded?.replace(/\s/g, '')
  if (!normalized || !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) throw failure('input validation')
  if (Buffer.from(normalized, 'base64').toString('base64') !== normalized) throw failure('input validation')
  return Buffer.from(normalized, 'base64')
}

function validateSetupInputs(context) {
  context.stage = 'input validation'
  const { env } = context
  if (!env.METIS_APPLE_CERTIFICATE_PASSWORD || !env.METIS_APPLE_NOTARY_PASSWORD) throw failure(context.stage)
  if (!safePath(env.GITHUB_ENV)) throw failure(context.stage)
  return decodeCertificate(env.METIS_APPLE_CERTIFICATE)
}

function validateOwnership(context) {
  context.stage = 'ownership validation'
  if ([context.keychain, context.metadata, context.certificate].some(pathExists)) throw failure(context.stage)
}

function saveOriginalSearchList(context, original) {
  context.stage = 'save search list'
  writeFileSync(context.metadata, JSON.stringify(original), { mode: 0o600, flag: 'wx' })
  context.ownsMetadata = true
}

function writeCertificate(context, certificate) {
  context.stage = 'write certificate'
  const file = openSync(context.certificate, 'wx', 0o600)
  context.ownsCertificate = true
  try { writeFileSync(file, certificate) } finally { closeSync(file) }
}

function configureSigningKeychain(context) {
  const { keychain, certificate, env } = context
  const password = randomBytes(32).toString('hex')
  security(context, 'create keychain', ['create-keychain', '-p', password, keychain])
  security(context, 'unlock keychain', ['unlock-keychain', '-p', password, keychain])
  security(context, 'configure keychain', ['set-keychain-settings', '-lut', '21600', keychain])
  security(context, 'import certificate', ['import', certificate, '-k', keychain, '-f', 'pkcs12',
    '-P', env.METIS_APPLE_CERTIFICATE_PASSWORD, '-T', '/usr/bin/codesign', '-T', '/usr/bin/security'])
  security(context, 'configure signing access', ['set-key-partition-list', '-S', 'apple-tool:,apple:,codesign:', '-s', '-k', password, keychain])
}

function storeNotaryCredentials(context) {
  command(context, 'store notary credentials', 'xcrun', ['notarytool', 'store-credentials', 'metis-release-ci',
    '--keychain', context.keychain, '--apple-id', 'contato@popcode.com.br', '--team-id', 'C42XKG5G6X',
    '--password', context.env.METIS_APPLE_NOTARY_PASSWORD])
}

function writeGitHubEnvironment(context) {
  context.stage = 'write GitHub environment'
  appendFileSync(context.env.GITHUB_ENV, `METIS_NOTARY_PROFILE=metis-release-ci\nMETIS_NOTARY_KEYCHAIN=${context.keychain}\nAPPLE_SIGNING_IDENTITY=Developer ID Application: Popcode (C42XKG5G6X)\n`)
}

function rollbackSetup(context) {
  const failedStage = context.stage
  if (context.ownsMetadata) {
    try { cleanupKeychain(context) } catch { throw failure(`${failedStage}; cleanup`) }
  }
  throw failure(failedStage)
}

function removeCertificate(context) {
  if (!context.ownsCertificate) return
  try { rmSync(context.certificate) } catch { throw failure('remove certificate') }
}

function setupKeychain(context) {
  try {
    const certificate = validateSetupInputs(context)
    validateOwnership(context)
    const original = readOriginalSearchList(context)
    saveOriginalSearchList(context, original)
    writeCertificate(context, certificate)
    configureSigningKeychain(context)
    security(context, 'set search list', ['list-keychains', '-d', 'user', '-s', context.keychain, ...original])
    storeNotaryCredentials(context)
    writeGitHubEnvironment(context)
  } catch { rollbackSetup(context) } finally { removeCertificate(context) }
}

export function runKeychain(action, { env = process.env, run = nativeRun } = {}) {
  validateInvocation(action, env)
  const context = createContext(action, env, run)
  if (action === 'setup') return setupKeychain(context)
  try { cleanupKeychain(context) } catch { throw failure('cleanup') }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { runKeychain(process.argv[2]) } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
