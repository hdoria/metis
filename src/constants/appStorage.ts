export const APP_STORAGE_KEYS = {
  theme: 'metis-theme',
  zoom: 'metis:zoom-level',
  viewMode: 'metis-view-mode',
  tagColors: 'metis:tag-color-overrides',
  statusColors: 'metis:status-color-overrides',
  propertyModes: 'metis:display-mode-overrides',
  configMigrationFlag: 'metis:config-migrated-to-vault',
  legacyMigrationFlag: 'metis:legacy-storage-migrated',
  sortPreferences: 'metis-sort-preferences',
  sidebarCollapsed: 'metis:sidebar-collapsed',
  rightPanelCollapsed: 'metis:right-panel-collapsed',
  lastActiveNotePath: 'metis:last-active-note-path',
  layoutPanels: 'metis:layout-panels',
  welcomeDismissed: 'metis_welcome_dismissed',
} as const

export const LEGACY_APP_STORAGE_KEYS = {
  theme: 'metislegacy-theme',
  zoom: 'metislegacy:zoom-level',
  viewMode: 'metislegacy-view-mode',
  tagColors: 'metislegacy:tag-color-overrides',
  statusColors: 'metislegacy:status-color-overrides',
  propertyModes: 'metislegacy:display-mode-overrides',
  configMigrationFlag: 'metislegacy:config-migrated-to-vault',
  sortPreferences: 'metislegacy-sort-preferences',
  sidebarCollapsed: 'metislegacy:sidebar-collapsed',
  layoutPanels: 'metislegacy:layout-panels',
  welcomeDismissed: 'metislegacy_welcome_dismissed',
} as const

type MigratableStorageKey = keyof typeof LEGACY_APP_STORAGE_KEYS

const MIGRATABLE_STORAGE_KEYS: MigratableStorageKey[] = [
  'theme',
  'zoom',
  'viewMode',
  'tagColors',
  'statusColors',
  'propertyModes',
  'configMigrationFlag',
  'sortPreferences',
  'sidebarCollapsed',
  'layoutPanels',
  'welcomeDismissed',
]

export function copyLegacyAppStorageKeys(): void {
  try {
    if (localStorage.getItem(APP_STORAGE_KEYS.legacyMigrationFlag) === '1') return

    for (const key of MIGRATABLE_STORAGE_KEYS) {
      const storageKey = Reflect.get(APP_STORAGE_KEYS, key) as string
      const legacyStorageKey = Reflect.get(LEGACY_APP_STORAGE_KEYS, key) as string
      if (localStorage.getItem(storageKey) !== null) continue

      const legacyValue = localStorage.getItem(legacyStorageKey)
      if (legacyValue !== null) {
        localStorage.setItem(storageKey, legacyValue)
      }
    }

    localStorage.setItem(APP_STORAGE_KEYS.legacyMigrationFlag, '1')
  } catch {
    // Ignore unavailable or restricted localStorage implementations.
  }
}

export function getAppStorageItem(key: MigratableStorageKey): string | null {
  try {
    const storageKey = Reflect.get(APP_STORAGE_KEYS, key) as string
    const legacyStorageKey = Reflect.get(LEGACY_APP_STORAGE_KEYS, key) as string
    return localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey)
  } catch {
    return null
  }
}
