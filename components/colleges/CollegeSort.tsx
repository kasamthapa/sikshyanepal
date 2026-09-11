import type { CollegeSearchParams } from './CollegeFilters'

const labels: Record<string, string> = {
  recommended: 'Most complete profiles',
  name: 'Name A–Z',
  rating: 'Student rating',
  'fee-low': 'Lowest published fee',
}

export default function CollegeSort({ searchParams, count }: { searchParams: CollegeSearchParams; count: number }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p aria-live="polite" className="text-sm text-gray-600">
        <strong className="font-semibold text-gray-950">{count}</strong> matching college{count === 1 ? '' : 's'}{searchParams.q ? <> for <strong className="font-semibold text-gray-950">“{searchParams.q}”</strong></> : null}
      </p>
      <form action="/colleges" className="flex items-center gap-2">
        {Object.entries(searchParams).filter(([key, value]) => value && !['sort', 'page'].includes(key)).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <label htmlFor="college-sort" className="shrink-0 text-sm font-medium text-gray-700">Sort by</label>
        <select id="college-sort" name="sort" defaultValue={searchParams.sort || 'recommended'} className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 sm:w-52">
          {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Apply</button>
      </form>
    </div>
  )
}
