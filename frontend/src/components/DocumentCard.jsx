const ICONS = {
  pdf: 'picture_as_pdf',
  image: 'image',
  article: 'article',
}

const ROTATIONS = ['-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2', '-rotate-3']

/**
 * A single "physical paper" document card in the library/bookshelf sidebar.
 * `active` lifts the card and adds an amber edge glow, representing the
 * source currently being referenced by the AI's answer.
 */
export default function DocumentCard({ name, type = 'pdf', active = false, index = 0, onClick }) {
  const rotation = ROTATIONS[index % ROTATIONS.length]

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div
        className={`absolute -inset-1 bg-primary/10 rounded-lg blur transition duration-300 ${
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      />
      <div
        className={`relative bg-surface-variant p-3 rounded-sm shadow-xl transform ${
          active ? 'rotate-0 -translate-y-1 ring-1 ring-primary/60' : `${rotation} hover:rotate-0`
        } transition-transform duration-300 border border-outline-variant/30 overflow-hidden`}
      >
        <div className="w-full h-24 bg-tertiary-container/20 rounded-sm mb-2 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary/40 text-4xl">
            {ICONS[type] ?? ICONS.article}
          </span>
        </div>
        <p className="font-label-mono text-[10px] text-on-surface-variant truncate">{name}</p>
      </div>
    </div>
  )
}
