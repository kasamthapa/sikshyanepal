'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Calculator, RotateCcw, Plus, Trash2 } from 'lucide-react'

const grades = [
  { label: 'A+', point: 4.0 }, { label: 'A', point: 3.6 }, { label: 'B+', point: 3.2 },
  { label: 'B', point: 2.8 }, { label: 'C+', point: 2.4 }, { label: 'C', point: 2.0 },
  { label: 'D+', point: 1.6 }, { label: 'D', point: 1.2 }, { label: 'E', point: 0.8 },
  { label: 'Not graded / fail', point: 0 },
]
type Subject = { id: number; name: string; grade: string; credit: number }
const initial = (): Subject[] => ['Compulsory English', 'Compulsory Nepali', 'Mathematics', 'Science', 'Social Studies', 'Optional subject'].map((name, index) => ({ id: index + 1, name, grade: '', credit: 1 }))

export default function GpaCalculatorPage() {
  const [subjects, setSubjects] = useState<Subject[]>(initial)
  const result = useMemo(() => {
    const completed = subjects.filter(subject => subject.grade)
    const credits = completed.reduce((sum, subject) => sum + Math.max(0, Number(subject.credit) || 0), 0)
    const points = completed.reduce((sum, subject) => sum + (grades.find(grade => grade.label === subject.grade)?.point || 0) * Math.max(0, Number(subject.credit) || 0), 0)
    return { completed: completed.length, gpa: credits ? points / credits : null }
  }, [subjects])
  const update = (id: number, changes: Partial<Subject>) => setSubjects(all => all.map(subject => subject.id === id ? { ...subject, ...changes } : subject))
  const add = () => setSubjects(all => [...all, { id: Date.now(), name: '', grade: '', credit: 1 }])

  return <div className="min-h-screen bg-[#f0f4ff]">
    <section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-primary">Student tools</p><h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">SEE & NEB GPA calculator</h1><p className="mt-3 max-w-2xl text-gray-500">Add your subjects and grades to calculate a weighted GPA. Your data stays in this browser—it is not saved or sent anywhere.</p></div></section>
    <main className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px]">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold text-ink">Your subjects</h2><button onClick={() => setSubjects(initial())} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-gray-500 hover:bg-blue-50 hover:text-primary"><RotateCcw className="h-4 w-4" />Reset</button></div><div className="mt-5 space-y-3">{subjects.map((subject, index) => <div key={subject.id} className="grid gap-2 rounded-xl bg-gray-50 p-3 sm:grid-cols-[1fr_130px_80px_44px] sm:items-center"><input aria-label={`Subject ${index + 1} name`} value={subject.name} onChange={event => update(subject.id, { name: event.target.value })} placeholder={`Subject ${index + 1}`} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary" /><select aria-label={`Grade for ${subject.name || `subject ${index + 1}`}`} value={subject.grade} onChange={event => update(subject.id, { grade: event.target.value })} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary"><option value="">Select grade</option>{grades.map(grade => <option key={grade.label} value={grade.label}>{grade.label} — {grade.point.toFixed(1)}</option>)}</select><input type="number" min="0" step="0.5" aria-label={`Credit for ${subject.name || `subject ${index + 1}`}`} value={subject.credit} onChange={event => update(subject.id, { credit: Number(event.target.value) })} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary" />{subjects.length > 1 ? <button onClick={() => setSubjects(all => all.filter(item => item.id !== subject.id))} aria-label={`Remove ${subject.name || 'subject'}`} className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button> : <span />}</div>)}</div><button onClick={add} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-blue-50"><Plus className="h-4 w-4" />Add subject</button><p className="mt-5 text-xs leading-5 text-gray-500">Use credit 1 for equal-weight subjects. For a course with theory and practical components, add them separately or use the official credit weighting.</p></section>
      <aside className="space-y-5"><section className="rounded-2xl bg-[#0d1b3e] p-6 text-white"><Calculator className="h-6 w-6 text-blue-300" /><p className="mt-5 text-sm font-semibold text-blue-200">Calculated GPA</p><p className="mt-1 font-mono text-5xl font-extrabold">{result.gpa === null ? '—' : result.gpa.toFixed(2)}</p><p className="mt-3 text-sm text-blue-100/75">{result.completed} subject{result.completed === 1 ? '' : 's'} graded</p></section><section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><h2 className="font-bold">Important</h2><p className="mt-2">This is an estimate based on entered grades and credits. Colleges may use their own eligibility rules, subject requirements, or entrance examinations. Confirm with the official admission notice.</p></section><Link href="/colleges" className="block rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white hover:bg-primary-600">Explore colleges and programs</Link></aside>
    </main>
  </div>
}
