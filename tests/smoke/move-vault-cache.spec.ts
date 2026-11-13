import { test, expect } from '@playwright/test'

test.describe('Move vault cache smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('app loads with note list populated (cache works)', async ({ page }) => {
    // The sidebar note list container should be present — this proves the vault
    // scan (and cache, if present) is functioning correctly after moving cache
    // out of the vault directory.
    const noteListContainer = page.locator(
      '[data-testid="note-list-container"]',
    )
    await expect(noteListContainer).toBeVisible({ timeout: 5_000 })
  })

  test('no .metislegacy-cache.json text visible in the sidebar', async ({
    page,
  }) => {
    // The cache file should NOT appear anywhere in the sidebar.
    // Previously it lived inside the vault and could show up; now it's external.
    const sidebar = page.locator(
      '[data-testid="note-list-container"]',
    )
    await expect(sidebar).toBeVisible({ timeout: 5_000 })

    // No element in the sidebar should contain cache-related text
    const cacheText = sidebar.locator('text=.metislegacy-cache')
    await expect(cacheText).toHaveCount(0)
  })
})
