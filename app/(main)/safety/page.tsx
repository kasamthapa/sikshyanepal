import type { Metadata } from 'next'
import PolicyPage from '@/components/community/PolicyPage'

export const metadata: Metadata = { title: 'Child Safety and Urgent Reports', description: 'SikshyaNepal child-safety rules, reporting routes and urgent support information for students and families.', alternates: { canonical: '/safety' } }

export default function SafetyPage() {
  return <PolicyPage eyebrow="Student protection" title="Child safety and urgent reports" intro="SikshyaNepal is designed for students, including people under 18. Safety takes priority over engagement.">
    <h2>Protect your identity</h2><p>Use a non-identifying public name. Never post a phone number, email, exact address, school roll number, private chat, identification document or live location.</p>
    <h2>Urgent concern</h2><p>If someone is in immediate danger, contact local emergency services and a trusted adult. The community is not an emergency or counselling service. Email safety@sikshyanepal.com for urgent platform safety reports and include the content link.</p>
    <h2>Our response</h2><p>We can hide content, restrict accounts, preserve relevant records and escalate credible child-safety or immediate-harm concerns to appropriate authorities. We do not provide private messaging or random one-to-one chat.</p>
  </PolicyPage>
}
