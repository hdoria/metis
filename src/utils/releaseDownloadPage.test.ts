import {
  buildStableDownloadRedirectPage,
  extractStableDownloadTargets,
  extractStableDownloadTargetsFromReleases,
  resolveStableDownloadTargets,
} from './releaseDownloadPage'

describe('extractStableDownloadTargets', () => {
  it('returns stable downloads for each supported desktop platform when present', () => {
    expect(
      extractStableDownloadTargets({
        platforms: {
          'darwin-aarch64': {
            download_url: 'https://example.com/Metis-aarch64.dmg',
          },
          'darwin-x86_64': {
            download_url: 'https://example.com/Metis-x64.dmg',
          },
          'linux-x86_64': {
            download_url: 'https://example.com/Metis.AppImage',
          },
          'windows-x86_64': {
            url: 'https://example.com/Metis-setup.exe',
          },
        },
      }),
    ).toMatchObject({
      'darwin-aarch64': {
        label: 'macOS Apple Silicon',
        url: 'https://example.com/Metis-aarch64.dmg',
      },
      'darwin-x86_64': {
        label: 'macOS Intel',
        url: 'https://example.com/Metis-x64.dmg',
      },
      'linux-x86_64': {
        label: 'Linux AppImage',
        url: 'https://example.com/Metis.AppImage',
      },
      'windows-x86_64': {
        label: 'Windows',
        url: 'https://example.com/Metis-setup.exe',
      },
    })
  })
})

describe('buildStableDownloadRedirectPage', () => {
  it('builds a redirect page with platform-specific download links', () => {
    const html = buildStableDownloadRedirectPage({
      'darwin-aarch64': {
        buttonLabel: 'Download Métis for macOS Apple Silicon',
        label: 'macOS Apple Silicon',
        url: 'https://example.com/Metis-aarch64.dmg',
      },
      'darwin-x86_64': {
        buttonLabel: 'Download Métis for Intel Mac',
        label: 'macOS Intel',
        url: 'https://example.com/Metis-x64.dmg',
      },
      'windows-x86_64': {
        buttonLabel: 'Download Métis for Windows',
        label: 'Windows',
        url: 'https://example.com/Metis-setup.exe',
      },
    })

    expect(html).toContain('Métis Stable Download')
    expect(html).toContain('DOWNLOAD_TARGETS')
    expect(html).toContain('Download Métis for Windows')
    expect(html).toContain('Windows updater bundles are signed')
    expect(html).toContain('Authenticode publisher signing is added when configured')
    expect(html).toContain('Download Métis for macOS Apple Silicon')
    expect(html).toContain('Download Métis for Intel Mac')
    expect(html).toContain('hasMultipleMacDownloads')
    expect(html).toContain('Choose the Apple Silicon or Intel Mac download below.')
    expect(html).toContain('requiresWindowsInstallChoice')
    expect(html).toContain('metis-download-frame')
    expect(html).toContain('color-scheme: light dark')
    expect(html).toContain('@media (prefers-color-scheme: dark)')
    expect(html).toContain('background: var(--download-surface-page)')
  })

  it('starts platform downloads without navigating away from the download page', () => {
    const html = buildStableDownloadRedirectPage({
      'windows-x86_64': {
        buttonLabel: 'Download Métis for Windows',
        label: 'Windows',
        url: 'https://example.com/Metis-setup.exe',
      },
    })

    expect(html).toContain('name="metis-download-frame"')
    expect(html).toContain('target="metis-download-frame"')
    expect(html).toContain('sandbox="allow-downloads"')
    expect(html).toContain('startDownload(target)')
    expect(html).toContain('Company-managed devices may require IT approval')
    expect(html).not.toContain('window.location.replace')
  })

  it('builds a fallback page when no stable downloads exist yet', () => {
    const html = buildStableDownloadRedirectPage({})

    expect(html).toContain('Métis Stable Download Unavailable')
    expect(html).toContain('View release history')
    expect(html).toContain('https://github.com/hdoria/metis/releases')
    expect(html).not.toContain('https://hdoria.github.io/metis/')
    expect(html).not.toContain('DOWNLOAD_TARGETS')
  })
})

describe('resolveStableDownloadTargets', () => {
  it('falls back to stable release assets when latest.json is incomplete', () => {
    const latestPayload = {
      platforms: {
        'darwin-aarch64': {
          download_url: 'https://example.com/Metis-aarch64.dmg',
        },
      },
    }
    const releasesPayload = [
      {
        prerelease: false,
        assets: [
          {
            name: 'Metis_x64.dmg',
            browser_download_url: 'https://example.com/Metis-x64.dmg',
          },
          {
            name: 'Metis-setup.exe',
            browser_download_url: 'https://example.com/Metis-setup.exe',
          },
          {
            name: 'Metis.AppImage',
            browser_download_url: 'https://example.com/Metis.AppImage',
          },
          {
            name: 'Metis.rpm',
            browser_download_url: 'https://example.com/Metis.rpm',
          },
        ],
      },
    ]

    expect(extractStableDownloadTargetsFromReleases(releasesPayload)).toMatchObject({
      'darwin-x86_64': {
        url: 'https://example.com/Metis-x64.dmg',
      },
      'linux-x86_64': {
        url: 'https://example.com/Metis.AppImage',
      },
      'linux-x86_64-rpm': {
        label: 'Linux RPM',
        url: 'https://example.com/Metis.rpm',
      },
      'windows-x86_64': {
        url: 'https://example.com/Metis-setup.exe',
      },
    })
    expect(resolveStableDownloadTargets(latestPayload, releasesPayload)).toMatchObject({
      'darwin-aarch64': {
        url: 'https://example.com/Metis-aarch64.dmg',
      },
      'darwin-x86_64': {
        url: 'https://example.com/Metis-x64.dmg',
      },
      'linux-x86_64': {
        url: 'https://example.com/Metis.AppImage',
      },
      'linux-x86_64-rpm': {
        label: 'Linux RPM',
        url: 'https://example.com/Metis.rpm',
      },
      'windows-x86_64': {
        url: 'https://example.com/Metis-setup.exe',
      },
    })
  })

  it('keeps AppImage as the Linux auto-download while exposing RPM manually', () => {
    const html = buildStableDownloadRedirectPage({
      'linux-x86_64': {
        buttonLabel: 'Download Métis AppImage for Linux',
        label: 'Linux AppImage',
        url: 'https://example.com/Metis.AppImage',
      },
      'linux-x86_64-rpm': {
        buttonLabel: 'Download Métis RPM for Linux',
        label: 'Linux RPM',
        url: 'https://example.com/Metis.rpm',
      },
    })

    expect(html).toContain('linux-x86_64-rpm')
    expect(html).toContain('Linux AppImage')
    expect(html).toContain('Linux RPM')
    expect(html).toContain("if (/Linux/i.test(userAgent) && !/Android/i.test(userAgent)) return 'linux-x86_64';")
  })
})
