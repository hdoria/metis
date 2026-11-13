const browserProtocols = new Set(['http:', 'https:'])
const nativeQaProtocols = new Set(['exp:', 'exps:', 'metis:'])

export function assertNativeQaOpenUrl(rawUrl: string, purpose: string) {
  const protocol = protocolForUrl(rawUrl)

  if (browserProtocols.has(protocol)) {
    throw new Error(
      `${purpose} must open the native Expo app, not Mobile Safari. Use an exp://, exps://, or metis:// URL instead of ${rawUrl}.`,
    )
  }

  if (!nativeQaProtocols.has(protocol)) {
    throw new Error(
      `${purpose} requires a native app deep link. Supported schemes: exp://, exps://, metis://.`,
    )
  }
}

function protocolForUrl(rawUrl: string) {
  try {
    return new URL(rawUrl).protocol.toLowerCase()
  } catch {
    throw new Error(`Invalid simulator URL for native QA: ${rawUrl}`)
  }
}
