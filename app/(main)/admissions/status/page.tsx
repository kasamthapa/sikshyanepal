import { redirect } from 'next/navigation'

export default function AdmissionStatusRedirect() {
  redirect('/admissions?view=status')
}
