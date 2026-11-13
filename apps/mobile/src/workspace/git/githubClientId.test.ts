import { expect, it } from 'vitest'
import { resolveGitHubClientId } from './githubClientId'

it.each([undefined, '', ' ', '\n\t'])('leaves GitHub sign-in unconfigured without an own public OAuth client (%j)', (override) => {
  expect(resolveGitHubClientId(override)).toBe('')
})

it('keeps an explicit public OAuth client override', () => {
  expect(resolveGitHubClientId('  public-test-client\n')).toBe('public-test-client')
})
