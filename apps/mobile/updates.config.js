/* global module, process */

function easProjectId(value = process.env.METIS_EAS_PROJECT_ID) {
  const projectId = (value || '').trim()
  if (projectId && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(projectId)) {
    throw new Error('METIS_EAS_PROJECT_ID must be the UUID of your own Expo project')
  }
  return projectId
}

function updateConfiguration(profile, requestedChannel, project = process.env.METIS_EAS_PROJECT_ID) {
  const channel = { testflight: 'alpha', production: 'stable', 'ota-validation': 'ota-validation' }[profile]
  if (requestedChannel && requestedChannel !== channel) {
    throw new Error('METIS_UPDATE_CHANNEL must match the build profile')
  }
  const projectId = easProjectId(project)
  if (!channel || !projectId) return { enabled: false }
  return {
    enabled: true,
    url: `https://u.expo.dev/${projectId}`,
    requestHeaders: { 'expo-channel-name': channel },
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
    useEmbeddedUpdate: true,
    disableAntiBrickingMeasures: false,
  }
}

module.exports = { easProjectId, updateConfiguration }
