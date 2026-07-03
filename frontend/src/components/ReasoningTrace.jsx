import { useState } from 'react'

/**
 * steps: [{ label: 'INTERNAL REPOSITORY', text: 'Checked Lecture Notes.pdf', active?: bool, source?: { label, excerpt } }]
 */
export default function ReasoningTrace({ steps = [], durationLabel = '~2.1s' }) {
  const [expanded, setExpanded] = useState(false)

  if (!steps.length) return null

  return (
    <div className="mt-auto pt-12">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 opacity-60 hover:opacity-100 cursor-pointer transition-opacity group w-full text-left"
      >
        <span className="material-symbols-outlined text-sm">visibility</span>
        <span className="font-label-mono text-[11px] uppercase tracking-wider">
          Thought for {steps.length} steps {durationLabel} — tap to {expanded ? 'collapse' : 'trace'}
        </span>
      </button>

      {expanded && (
        <div className="mt-6 pl-2 space-y-0 border-t border-parchment-ink/10 pt-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className={`reasoning-dot ${step.active ? 'active' : ''}`} />
                {i < steps.length - 1 && <div className="reasoning-line" />}
              </div>
              <div className="pb-8">
                <p className="font-label-mono text-label-mono text-[#504537]/60 mb-1">
                  {step.label}
                </p>
                <p className="font-body-md text-[#14161F]">{step.text}</p>
                {step.source && (
                  <div className="mt-4 bg-tertiary-fixed-dim/30 p-4 torn-edge border-l-4 border-primary-container ml-2 relative">
                    <p className="font-label-mono text-[10px] leading-relaxed text-[#504537]">
                      {step.source}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
