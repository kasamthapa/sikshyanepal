import type { Metadata } from 'next'
import PolicyPage from '@/components/community/PolicyPage'

export const metadata: Metadata = { title: 'Copyright and Takedown Policy', description: 'Copyright rules and the process for requesting removal of material published on SikshyaNepal.', alternates: { canonical: '/copyright' } }

export default function CopyrightPage() {
  return <PolicyPage eyebrow="Legal & trust" title="Copyright and takedown policy" intro="Only upload material you created or have permission to share.">
    <h2>Request removal</h2><p>Email copyright@sikshyanepal.com with your name, contact details, the SikshyaNepal URL, identification of the original work, and a good-faith explanation of your rights. We may temporarily hide disputed content while reviewing it.</p>
    <h2>Counter-request</h2><p>If your content was removed by mistake, reply with proof that you created it or have permission to use it. Repeated infringement may lead to account restriction.</p>
  </PolicyPage>
}
