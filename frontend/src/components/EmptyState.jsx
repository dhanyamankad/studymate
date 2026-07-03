/**
 * Zero-hallucination fallback. Deliberately quiet, not an error state:
 * dashed border, dimmed glow, honest copy instead of a red alert box.
 */
export default function EmptyState({ timestampLabel = 'End of Inquiry' }) {
  return (
    <div className="relative w-full max-w-[600px] mx-auto text-center">
      <div className="parchment-grain relative bg-tertiary text-on-tertiary p-12 rounded-xl shadow-2xl border-2 border-dashed border-outline-variant/40 transition-all duration-700">
        <div className="absolute inset-0 bg-secondary-container/5 rounded-xl animate-pulse blur-3xl -z-10" />
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-outline text-3xl">search_off</span>
          </div>
          <h3 className="font-display-lg text-headline-md text-on-tertiary-container tracking-tight italic">
            "Nothing in your sources or the web confirms this yet."
          </h3>
          <p className="font-body-md text-on-tertiary-container/70 max-w-sm mx-auto leading-relaxed">
            Try rephrasing, or upload more material. My ink cannot trace a path where no
            record exists in the silent stacks.
          </p>
        </div>

        <div className="absolute -bottom-8 -right-4 w-48 h-12 bg-tertiary-fixed-dim rounded-sm torn-edge shadow-md -rotate-2 flex items-center justify-center p-2 opacity-90 transform hover:translate-y-[-4px] transition-transform">
          <span className="font-label-mono text-[10px] text-on-tertiary-container/50 uppercase tracking-[0.2em]">
            {timestampLabel}
          </span>
        </div>
      </div>
    </div>
  )
}
