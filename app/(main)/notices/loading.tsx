// Skeleton shown by Next.js while notices/page.tsx is loading
export default function NoticesLoading() {
  return (
    <div className="bg-[#f8f7f3] min-h-screen">
      {/* Page header skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="h-5 w-32 bg-gray-200 rounded-full animate-pulse mb-3" />
          <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mb-6" />
          <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-12 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      {/* List skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-5" />
        <div className="space-y-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="relative bg-white rounded-xl border border-gray-200 overflow-hidden p-4 pl-5"
            >
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 animate-pulse" />
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-8 bg-gray-100 rounded animate-pulse flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-12 bg-gray-100 rounded border border-gray-100 animate-pulse" />
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
