import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const { updateConfiguration } = createRequire(import.meta.url)('../updates.config.js')
const projectId = '11111111-2222-4333-8444-555555555555'

test('release builds stay offline when this fork has no update project', () => {
  for (const profile of ['testflight', 'production', 'ota-validation']) {
    assert.deepEqual(updateConfiguration(profile, undefined, ''), { enabled: false })
  }
})

test('explicitly configured update projects preserve channel and embedded recovery', () => {
  assert.deepEqual(updateConfiguration('production', 'stable', projectId), {
    enabled: true,
    url: `https://u.expo.dev/${projectId}`,
    requestHeaders: { 'expo-channel-name': 'stable' },
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
    useEmbeddedUpdate: true,
    disableAntiBrickingMeasures: false,
  })
})

test('rejects invalid project identities and cross-channel routing', () => {
  assert.throws(() => updateConfiguration('production', 'stable', 'not-a-project'), /METIS_EAS_PROJECT_ID/)
  assert.throws(() => updateConfiguration('testflight', 'stable', projectId), /METIS_UPDATE_CHANNEL/)
})
