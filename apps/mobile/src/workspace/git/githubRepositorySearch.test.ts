import { describe, expect, it } from 'vitest'
import { filterGitHubRepositories } from './githubRepositorySearch'

const repositories = [
  { id: 1, full_name: 'example-team/PrivateNotes', clone_url: 'https://github.com/example-team/PrivateNotes.git', private: true },
  { id: 2, full_name: 'example/notes', clone_url: 'https://github.com/example/notes.git', private: false },
  { id: 3, full_name: 'hdoria/metis', clone_url: 'https://github.com/hdoria/metis.git', private: false },
]

describe('repository picker search', () => {
  it('preserves the updated-first GitHub order for a blank query', () => {
    expect(filterGitHubRepositories(repositories, '  ')).toEqual(repositories)
  })
  it('matches owner and repository case-insensitively across query words', () => {
    expect(filterGitHubRepositories(repositories, ' EXAM private ')).toEqual([repositories[0]])
  })
  it('does not replace an empty result with unrelated repositories', () => {
    expect(filterGitHubRepositories(repositories, 'missing')).toEqual([])
  })
})
