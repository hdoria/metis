import { Bug, GitPullRequest, Lightbulb } from '@phosphor-icons/react'
import type { TranslationKey } from '../lib/i18n'

export const METIS_GITHUB_URL = 'https://github.com/hdoria/metis'
export const METIS_DOCS_URL = `${METIS_GITHUB_URL}/blob/main/site/`
export const METIS_FIRST_LAUNCH_DOCS_URL = `${METIS_DOCS_URL}start/first-launch.md`
export const METIS_PRODUCT_BOARD_URL = `${METIS_GITHUB_URL}/issues`
export const METIS_GITHUB_CONTRIBUTING_URL = `${METIS_GITHUB_URL}/blob/main/CONTRIBUTING.md`
export const METIS_GITHUB_ISSUES_URL = `${METIS_GITHUB_URL}/issues`
export const METIS_GITHUB_PULL_REQUESTS_URL = `${METIS_GITHUB_URL}/pulls`

export type ContributionTone = 'blue' | 'green' | 'yellow' | 'purple' | 'red'
export type ContributionIcon = typeof Lightbulb
export type ContributionAnalyticsAction = 'feature_requests' | 'github' | 'pull_requests' | 'contributing_guide' | 'issues' | 'copy_diagnostics'

export interface ContributionLink {
  analyticsAction: ContributionAnalyticsAction
  ctaLabelKey: TranslationKey
  labelKey: TranslationKey
  url: string
}
export interface ContributionPath extends ContributionLink {
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  icon: ContributionIcon
  tone: ContributionTone
  secondaryLink?: ContributionLink
}
export const CONTRIBUTION_ANALYTICS_EVENT = 'contribution_action_clicked'
export const CONTRIBUTION_ANALYTICS_SURFACE = 'contribute_dialog'
export const CONTRIBUTION_PATHS = [
  {
    analyticsAction: 'feature_requests', titleKey: 'feedback.featureRequests.title',
    descriptionKey: 'feedback.featureRequests.description', ctaLabelKey: 'feedback.featureRequests.cta',
    labelKey: 'feedback.featureRequests.linkLabel', url: METIS_PRODUCT_BOARD_URL, icon: Lightbulb, tone: 'green',
  },
  {
    analyticsAction: 'pull_requests', titleKey: 'feedback.contributeCode.title',
    descriptionKey: 'feedback.contributeCode.description', ctaLabelKey: 'feedback.contributeCode.cta',
    labelKey: 'feedback.contributeCode.linkLabel', url: METIS_GITHUB_PULL_REQUESTS_URL, icon: GitPullRequest, tone: 'yellow',
    secondaryLink: {
      analyticsAction: 'contributing_guide', ctaLabelKey: 'feedback.contributingGuide.cta',
      labelKey: 'feedback.contributingGuide.linkLabel', url: METIS_GITHUB_CONTRIBUTING_URL,
    },
  },
] satisfies ContributionPath[]
export const BUG_REPORT_PATH = {
  analyticsAction: 'issues', titleKey: 'feedback.reportBug.title', descriptionKey: 'feedback.reportBug.description',
  ctaLabelKey: 'feedback.reportBug.cta', labelKey: 'feedback.reportBug.linkLabel', url: METIS_GITHUB_ISSUES_URL,
  icon: Bug, tone: 'red',
} satisfies ContributionPath
