export function resolveGitHubClientId(override: string | undefined): string {
  return override?.trim() || ''
}
