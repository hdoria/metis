import { createRequire } from 'node:module'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { ExpoConfig } from 'expo/config'
import manifest from '../../app.json'

const require = createRequire(import.meta.url)
const configure: (context: { config: typeof manifest.expo }) => ExpoConfig = require('../../app.config.js')

beforeEach(() => {
  vi.stubEnv('METIS_BUILD_PROFILE', undefined)
  vi.stubEnv('METIS_IOS_BUILD_NUMBER', undefined)
  vi.stubEnv('METIS_UPDATE_CHANNEL', undefined)
  vi.stubEnv('METIS_EAS_PROJECT_ID', undefined)
  vi.stubEnv('METIS_EXPO_OWNER', undefined)
  vi.stubEnv('METIS_APPLE_TEAM_ID', undefined)
  vi.stubEnv('EXPO_PUBLIC_POSTHOG_HOST', undefined)
  vi.stubEnv('VITE_POSTHOG_HOST', undefined)
  vi.stubEnv('EXPO_PUBLIC_DISTRIBUTION', 'testflight')
  vi.stubEnv('EXPO_PUBLIC_RELEASE_CHANNEL', 'alpha')
})

afterEach(() => vi.unstubAllEnvs())

function configuredApp() {
  return configure({ config: structuredClone(manifest.expo) })
}

function testFlight(build = '1') {
  vi.stubEnv('METIS_BUILD_PROFILE', 'testflight')
  vi.stubEnv('METIS_IOS_BUILD_NUMBER', build)
  return configuredApp()
}

it('enables the supported scene lifecycle for native builds', () => {
  expect(configuredApp().plugins).toContainEqual(['expo-build-properties', {
    ios: { enableSceneSupport: true },
  }])
  expect(testFlight().plugins).toContainEqual(['expo-build-properties', {
    ios: { enableSceneSupport: true },
  }])
})

it('preserves other config plugins when enabling scene support', () => {
  const config = { ...structuredClone(manifest.expo), plugins: ['expo-asset'] }
  expect(configure({ config }).plugins).toContain('expo-asset')
})

it('defaults mobile PostHog ingestion to the desktop US project region', () => {
  expect(configuredApp().extra?.telemetry?.posthogHost).toBe('https://us.i.posthog.com')
})

it('prefers the explicit Expo host and falls back to the Vite host', () => {
  vi.stubEnv('VITE_POSTHOG_HOST', 'https://vite.example.com')
  expect(configuredApp().extra?.telemetry?.posthogHost).toBe('https://vite.example.com')

  vi.stubEnv('EXPO_PUBLIC_POSTHOG_HOST', 'https://expo.example.com')
  expect(configuredApp().extra?.telemetry?.posthogHost).toBe('https://expo.example.com')
})

it.each([undefined, 'development'])('preserves the development sandbox for profile %s', (profile) => {
  vi.stubEnv('METIS_BUILD_PROFILE', profile)
  vi.stubEnv('METIS_IOS_BUILD_NUMBER', '99')
  const app = configuredApp()
  expect(app.ios).toEqual(manifest.expo.ios)
  expect(app.android).toEqual(manifest.expo.android)
})

it('uses the approved production identity without losing native settings', () => {
  const app = testFlight('42')
  expect(app.ios).toEqual({
    ...manifest.expo.ios,
    bundleIdentifier: 'io.github.hdoria.metis.mobile',
    appleTeamId: undefined,
    buildNumber: '42',
  })
  expect(app.name).toBe('Métis')
  expect(app.android).toEqual(manifest.expo.android)
  expect(manifest.expo.ios.bundleIdentifier).toBe('io.github.hdoria.metis.mobile.dev')
})

it.each([undefined, '', '0', '-1', '01', '1.2', '1e2', ' 1 ', '10000'])('rejects invalid TestFlight build number %s', (build) => {
  vi.stubEnv('METIS_BUILD_PROFILE', 'testflight')
  vi.stubEnv('METIS_IOS_BUILD_NUMBER', build)
  expect(configuredApp).toThrow('METIS_IOS_BUILD_NUMBER')
})

it('refuses unknown profiles instead of silently building the development app', () => {
  vi.stubEnv('METIS_BUILD_PROFILE', 'testfligth')
  expect(configuredApp).toThrow('METIS_BUILD_PROFILE')
})

it.each(['EXPO_PUBLIC_DISTRIBUTION', 'EXPO_PUBLIC_RELEASE_CHANNEL'])('refuses incorrect TestFlight attribution in %s', (key) => {
  vi.stubEnv(key, 'internal')
  expect(() => testFlight()).toThrow(key)
})

it('keeps signing and upload secrets out of the public application manifest', () => {
  vi.stubEnv('SENTRY_AUTH_TOKEN', 'private-upload-placeholder')
  vi.stubEnv('ASC_API_KEY', 'private-signing-placeholder')
  const serialized = JSON.stringify(testFlight())
  expect(serialized).not.toContain('private-upload-placeholder')
  expect(serialized).not.toContain('private-signing-placeholder')
})

it('leaves Expo ownership, updates and signing unconfigured by default', () => {
  const app = configuredApp()
  expect(app.owner).toBeUndefined()
  expect(app.extra?.eas).toBeUndefined()
  expect(app.ios?.appleTeamId).toBeUndefined()
  expect(app.updates?.enabled).toBe(false)
  expect(app.runtimeVersion).toEqual({ policy: 'fingerprint' })
})

it('downloads updates only from an explicitly configured project', () => {
  vi.stubEnv('METIS_EAS_PROJECT_ID', '11111111-2222-4333-8444-555555555555')
  expect(testFlight().updates).toEqual({
    enabled: true,
    url: 'https://u.expo.dev/11111111-2222-4333-8444-555555555555',
    requestHeaders: { 'expo-channel-name': 'alpha' },
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
    useEmbeddedUpdate: true,
    disableAntiBrickingMeasures: false,
  })
})

it('isolates OTA acceptance from every existing development and release vault container', () => {
  vi.stubEnv('METIS_BUILD_PROFILE', 'ota-validation')
  vi.stubEnv('METIS_UPDATE_CHANNEL', 'ota-validation')
  const app = configuredApp()
  expect(app.ios?.bundleIdentifier).toBe('io.github.hdoria.metis.mobile.ota-validation')
  expect(app.android?.package).toBe('io.github.hdoria.metis.mobile.ota_validation')
  expect(app.updates).toEqual({ enabled: false })
})

it('rejects accidental cross-channel publishing from a TestFlight build profile', () => {
  vi.stubEnv('METIS_UPDATE_CHANNEL', 'stable')
  expect(() => testFlight()).toThrow('METIS_UPDATE_CHANNEL')
})

it('keeps JavaScript-only validation markers out of the native fingerprint configuration', () => {
  vi.stubEnv('METIS_BUILD_PROFILE', 'ota-validation')
  const embedded = configuredApp()
  vi.stubEnv('EXPO_PUBLIC_OTA_VALIDATION_MARKER', 'update-b')
  expect(JSON.stringify(configuredApp())).toBe(JSON.stringify(embedded))
  expect(embedded.extra?.otaValidationMarker).toBeUndefined()
})
