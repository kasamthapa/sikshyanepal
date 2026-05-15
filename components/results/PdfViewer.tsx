'use client'

import { useState } from 'react'
import { Download, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface PdfViewerProps {
  pdfUrl: string
  title:  string
}

export default function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
  const [loading,    setLoading]    = useState(true)
  const [errored,    setErrored]    = useState(false)
  const [useGdocs,   setUseGdocs]   = useState(false)

  // Google Docs Viewer can display PDFs from any HTTPS URL
  const gdocsUrl  = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
  const iframeSrc = useGdocs ? gdocsUrl : pdfUrl

  function handleLoad() {
    setLoading(false)
    setErrored(false)
  }

  function handleError() {
    setLoading(false)
    if (!useGdocs) {
      // Auto-fallback to Google Docs Viewer on first failure
      setUseGdocs(true)
      setLoading(true)
      setErrored(false)
    } else {
      setErrored(true)
    }
  }

  function retryDirect() {
    setUseGdocs(false)
    setLoading(true)
    setErrored(false)
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0">
            PDF
          </span>
          <span className="text-xs text-gray-500 truncate hidden sm:block">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {useGdocs && (
            <button
              onClick={retryDirect}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Direct
            </button>
          )}
          <a
            href={pdfUrl}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </a>
        </div>
      </div>

      {/* PDF frame */}
      <div className="relative bg-gray-100" style={{ height: '680px' }}>
        {loading && !errored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 z-10 bg-gray-100">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Loading PDF…</p>
          </div>
        )}

        {errored ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div>
              <p className="font-semibold text-gray-700 mb-1">Could not display the PDF</p>
              <p className="text-sm text-gray-500 mb-4">
                The PDF couldn&apos;t be embedded. Download it or open in a new tab instead.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </a>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeSrc}            // remount on src change
            src={iframeSrc}
            title={title}
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>

      {useGdocs && !errored && (
        <p className="text-center text-[11px] text-gray-400 py-2 bg-gray-50 border-t border-gray-200">
          Displayed via Google Docs Viewer
        </p>
      )}
    </div>
  )
}
