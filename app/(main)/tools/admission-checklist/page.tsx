import { redirect } from 'next/navigation'

export default function AdmissionChecklistRedirect() {
  redirect('/admissions/planner#application-checklist')
}
