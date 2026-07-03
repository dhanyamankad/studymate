import { useState } from 'react'

/**
 * Torn-paper citation badge with a 3D flip-to-reveal interaction.
 * Clicking flips the card to show the exact excerpt/crop that was used —
 * "here's the receipt of proof beneath the claim."
 *
 * citation: {
 *   type: 'pdf' | 'image' | 'web',
 *   label: string,
 *   meta?: string,
 *   thumbnail?: string,   // image type only
 *   excerpt?: string,     // shown on the back face; falls back to a generic note
 * }
 */
export default function CitationBadge({ citation, onSelect }) {
  const { type, label, meta, excerpt } = citation
  const [flipped, setFlipped] = useState(false)

  function handleClick() {
    setFlipped((f) => !f)
    onSelect?.(citation)
  }

  return (
    <div className="[perspective:1000px] w-48 h-20 shrink-0">
      <button
        onClick={handleClick}
        aria-pressed={flipped}
        aria-label={`Citation: ${label}. ${flipped ? 'Showing excerpt, tap to close' : 'Tap to view excerpt'}`}
        className="relative w-full h-full text-left cursor-pointer [transform-style:preserve-3d] transition-transform duration-500 ease-out"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front face */}
        <div className="absolute inset-0 [backface-visibility:hidden] torn-edge bg-parchment-card border border-parchment-border shadow-sm flex items-center gap-3 px-4 py-3 hover:-translate-y-1 transition-transform">
          {type === 'pdf' && (
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg text-[#504537]">picture_as_pdf</span>
            </div>
          )}

          {type === 'image' && (
            <div className="w-8 h-8 rounded-sm bg-parchment-ink/10 transform -rotate-6 overflow-hidden border border-parchment-ink/10 shrink-0">
              {citation.thumbnail ? (
                <img src={citation.thumbnail} alt="" className="w-full h-full object-cover grayscale opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-[#504537]">image</span>
                </div>
              )}
            </div>
          )}

          {type === 'web' && (
            <div className="relative shrink-0">
              <span className="material-symbols-outlined text-lg text-[#504537]">language</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="font-label-mono text-[10px] leading-tight text-[#504537] truncate">
              {label}
            </span>
            {meta && <span className="font-label-mono text-[9px] opacity-60 text-[#504537]">{meta}</span>}
          </div>

          <span className="material-symbols-outlined text-xs text-[#504537]/40 ml-auto shrink-0">
            flip
          </span>
        </div>

        {/* Back face — the excerpt/evidence */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] torn-edge bg-[#2c2416] border border-primary-container/30 shadow-sm px-4 py-3 overflow-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <p className="font-label-mono text-[9px] leading-snug text-primary-container/90 line-clamp-4">
            {excerpt ?? `Excerpt not available — open ${label} directly to verify.`}
          </p>
        </div>
      </button>
    </div>
  )
}
