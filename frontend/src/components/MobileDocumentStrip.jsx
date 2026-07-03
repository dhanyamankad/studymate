import UploadZone from './UploadZone'

const ICONS = { pdf: 'picture_as_pdf', image: 'image', article: 'article' }

/**
 * Mobile equivalent of the desktop Sidebar — a horizontally swipeable strip
 * of tilted paper cards, plus its own upload zone, sitting above the answer
 * surface. Only rendered below the md breakpoint (desktop uses Sidebar
 * instead, which has its own separate UploadZone instance).
 */
export default function MobileDocumentStrip({ documents = [], activeDocId, onSelectDocument, onFilesAdded }) {
  return (
    <div className="md:hidden w-full px-page-margin pt-4">
      <UploadZone onFilesAdded={onFilesAdded} />

      <label className="font-label-mono text-label-mono text-on-surface-variant/50 mt-4 mb-2 block uppercase tracking-widest">
        Library
      </label>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none -mx-page-margin px-page-margin">
        {documents.map((doc) => {
          const active = doc.id === activeDocId
          return (
            <button
              key={doc.id}
              onClick={() => onSelectDocument?.(doc.id)}
              className={`relative shrink-0 snap-start w-28 bg-surface-variant p-2 rounded-sm shadow-lg border transition-all duration-300 ${
                active
                  ? 'border-primary/60 -translate-y-1 ring-1 ring-primary/50'
                  : 'border-outline-variant/30 opacity-70'
              }`}
            >
              {doc.status && (
                <span
                  className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                    doc.status === 'ready'
                      ? 'bg-emerald-400'
                      : doc.status === 'error'
                      ? 'bg-rose-500'
                      : 'bg-amber-400 animate-pulse'
                  }`}
                  title={doc.status === 'ready' ? 'Ready' : doc.status === 'error' ? 'Upload failed' : 'Processing…'}
                />
              )}
              <div className="w-full h-16 bg-tertiary-container/20 rounded-sm mb-2 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/40 text-2xl">
                  {ICONS[doc.type] ?? ICONS.article}
                </span>
              </div>
              <p className="font-label-mono text-[9px] text-on-surface-variant truncate text-left">
                {doc.name}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
