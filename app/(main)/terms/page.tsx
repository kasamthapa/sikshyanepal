import type { Metadata } from 'next'
import PolicyPage from '@/components/community/PolicyPage'

export const metadata: Metadata = { title: 'Terms of Use', description: 'Terms for using SikshyaNepal education information, accounts, submissions and moderated community features.', alternates: { canonical: '/terms' } }

export default function TermsPage() {
  return <PolicyPage eyebrow="Legal & trust" title="Terms of use" intro="By using SikshyaNepal you agree to use the platform lawfully, honestly and safely.">
    <h2>Community participation</h2><p>You must use your own Google-authenticated account and may choose a non-identifying public name. You may not impersonate another person, evade a restriction, or falsely claim that your account is untraceable. You are responsible for content submitted through your account.</p>
    <h2>Content and moderation</h2><p>You grant SikshyaNepal permission to host and display submitted content for operating the service. You must own it or have permission to share it. We may review, reject, remove, preserve or disclose content where required for safety, enforcement or law. Moderation does not make user claims verified.</p>
    <h2>Education information</h2><p>Deadlines, fees, eligibility and results can change. Confirm important decisions with the named institution or official authority. SikshyaNepal does not guarantee admission, scholarship or employment outcomes.</p>
    <h2>Paid content</h2><p>Commercial placements and paid college content must be marked “Sponsored” or “Advertisement.” Payment does not permit false factual claims or remove editorial and safety review.</p>
    <h2>Appeals and complaints</h2><p>Send moderation appeals to safety@sikshyanepal.com and general complaints to info@sikshyanepal.com. Include the page link and a concise explanation; do not email unnecessary sensitive information.</p>
  </PolicyPage>
}
