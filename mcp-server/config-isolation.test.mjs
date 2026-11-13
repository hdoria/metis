import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { appConfigFilePath, requireVaultPaths } from './vault-path.js'

test('fresh installations ignore vaults and secrets from other namespaces', async () => {
  const configDir = await mkdtemp(path.join(os.tmpdir(), 'metis-config-isolation-'))
  try {
    for (const namespace of ['io.github.hdoria.metis.legacy', 'com.example.other']) {
      await mkdir(path.join(configDir, namespace), { recursive: true })
      await writeFile(path.join(configDir, namespace, 'vaults.json'), JSON.stringify({
        active_vault: '/private/another-app/vault', vaults: [],
      }))
      await writeFile(path.join(configDir, namespace, 'ai-provider-secrets.json'), '{}')
    }
    assert.throws(() => requireVaultPaths({}, { configDir }), /VAULT_PATH is required/)
    assert.equal(
      appConfigFilePath('ai-provider-secrets.json', { configDir }),
      path.join(configDir, 'io.github.hdoria.metis', 'ai-provider-secrets.json'),
    )
    const ownConfig = path.join(configDir, 'io.github.hdoria.metis')
    await mkdir(ownConfig)
    await writeFile(path.join(ownConfig, 'vaults.json'), JSON.stringify({
      active_vault: '/private/metis/vault', vaults: [],
    }))
    assert.deepEqual(requireVaultPaths({}, { configDir }), ['/private/metis/vault'])
  } finally {
    await rm(configDir, { recursive: true, force: true })
  }
})

test('development MCP processes select only the declared development namespace', () => {
  const moduleUrl = new URL('./vault-path.js', import.meta.url).href
  for (const [requested, expected] of [
    ['io.github.hdoria.metis.dev', 'io.github.hdoria.metis.dev'],
    ['com.example.other', 'io.github.hdoria.metis'],
  ]) {
    const program = `import { appConfigFilePath } from ${JSON.stringify(moduleUrl)};
      process.stdout.write(appConfigFilePath('vaults.json', { configDir: '/metis-config-isolation' }));`
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', program], {
      env: { ...process.env, METIS_APP_CONFIG_NAMESPACE: requested },
      encoding: 'utf8',
    })
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.stdout, path.join('/metis-config-isolation', expected, 'vaults.json'))
  }
})
