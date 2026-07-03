import CitationBadge from './CitationBadge'
import ReasoningTrace from './ReasoningTrace'

/**
 * The "open notebook page" answer surface.
 * exchange: {
 *   question: string,
 *   answer: string[]            // paragraphs
 *   citations: Citation[]       // rendered as a row beneath the answer
 *   reasoningSteps: Step[]
 *   thinking?: boolean          // shows the watercolor pulse wash
 * }
 */
export default function AnswerCard({ exchange, onSelectCitation }) {
  const { question, answer = [], citations = [], reasoningSteps = [], thinking = false } = exchange

  return (
    <div className="relative bg-parchment parchment-grain text-parchment-ink p-12 rounded-sm shadow-2xl min-h-[500px] border border-parchment-border flex flex-col">
      {thinking && (
        <div className="absolute inset-0 bg-secondary-container/5 pulse-soft pointer-events-none rounded-sm" />
      )}

      <div className="mb-10 relative">
        <h2 className="font-question-accent text-question-accent text-[#2c3e50] mb-2 opacity-80">
          {question}
        </h2>
        <div className="h-px w-32 bg-parchment-ink/10" />
      </div>

      <div className="space-y-6 relative z-10 leading-relaxed font-body-lg text-body-lg">
        {answer.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {citations.length > 0 && (
        <div className="mt-10 pt-8 border-t border-parchment-ink/10">
          <div className="flex flex-wrap gap-4 items-start">
            {citations.map((c, i) => (
              <CitationBadge key={i} citation={c} onSelect={onSelectCitation} />
            ))}
          </div>
        </div>
      )}

      <ReasoningTrace steps={reasoningSteps} />
    </div>
  )
}
