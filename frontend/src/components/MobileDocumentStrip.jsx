const ICONS = { pdf: 'picture_as_pdf', image: 'image', article: 'article' }

/**
 * Mobile equivalent of the desktop Sidebar's library — a horizontally
 * swipeable strip of tilted paper cards, sitting above the answer surface.
 * Only rendered below the md breakpoint (desktop uses Sidebar instead).
 */
export default function MobileDocumentStrip({ documents = [], activeDocId, onSelectDocument }) {
  return (
    <div className="md:hidden w-full px-page-margin pt-4">
      <label className="font-label-mono text-label-mono text-on-surface-variant/50 mb-2 block uppercase tracking-widest">
        Library
      </label>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none -mx-page-margin px-page-margin">
        {documents.map((doc) => {
          const active = doc.id === activeDocId
          return (
            <button
              key={doc.id}
              onClick={() => onSelectDocument?.(doc.id)}
              className={`shrink-0 snap-start w-28 bg-surface-variant p-2 rounded-sm shadow-lg border transition-all duration-300 ${
                active
                  ? 'border-primary/60 -translate-y-1 ring-1 ring-primary/50'
                  : 'border-outline-variant/30 opacity-70'
              }`}
            >
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
