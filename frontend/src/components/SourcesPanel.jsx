const ICONS = { pdf: 'description', image: 'image', web: 'public' }

/**
 * Multi-document source selection view — reachable from the "Resources" nav tab.
 * Shows all active sources as cards: the currently-referenced source is lifted,
 * starred, and edge-glowing; the rest sit resting and tilted, matching the
 * "Nocturnal Scholar" physical-desk metaphor. Clicking a card sets it active.
 */
export default function SourcesPanel({ sources = [], activeSourceId, onSelectSource, onAddResource }) {
  return (
    <div className="max-w-[900px] mx-auto px-page-margin py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="font-label-mono text-label-mono uppercase text-on-surface-variant tracking-widest mb-1">
            Active Sources
          </h3>
          <p className="font-body-md text-sm text-on-surface-variant/60">
            The source StudyMate is currently drawing from is lifted and starred.
          </p>
        </div>
        <button
          onClick={onAddResource}
          className="text-primary font-label-mono text-[10px] uppercase border-b border-primary/30 hover:border-primary transition-all shrink-0"
        >
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source, i) => {
          const active = source.id === activeSourceId
          const rotation = ['-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1'][i % 4]

          return (
            <button
              key={source.id}
              onClick={() => onSelectSource?.(source.id)}
              className={`text-left bg-tertiary parchment-grain p-6 rounded-lg text-on-tertiary transition-all duration-500 ${
                active
                  ? 'shadow-xl scale-[1.02] ring-2 ring-primary-container/60 rotate-0'
                  : `opacity-70 hover:opacity-100 hover:scale-[1.01] transform ${rotation}`
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-on-tertiary-container">
                  {ICONS[source.type] ?? ICONS.pdf}
                </span>
                {active && (
                  <span
                    className="material-symbols-outlined text-primary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stars
                  </span>
                )}
              </div>

              <h4 className="font-headline-md text-lg leading-tight mb-2">{source.title}</h4>

              {source.description && (
                <p className="font-body-md text-sm opacity-80 line-clamp-2 mb-3">
                  {source.description}
                </p>
              )}

              <div className="pt-4 border-t border-on-tertiary/10 flex items-center justify-between">
                <span className="font-label-mono text-[10px]">{source.relevance ?? source.status}</span>
                <span className="font-label-mono text-[10px] uppercase">{source.sourceLabel}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
