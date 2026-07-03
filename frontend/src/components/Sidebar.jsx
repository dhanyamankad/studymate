import DocumentCard from './DocumentCard'
import UploadZone from './UploadZone'

export default function Sidebar({ documents = [], activeDocId, onSelectDocument, onNewResearch, onFilesAdded }) {
  return (
    <aside className="w-64 h-full bg-surface border-r border-outline-variant/10 flex flex-col py-8 px-4 z-20 shrink-0 hidden md:flex">
      <div className="mb-10 px-2">
        <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
          StudyMate
        </h1>
        <p className="font-label-mono text-label-mono text-on-surface-variant mt-1 uppercase">
          Midnight Session
        </p>
      </div>

      <div className="px-2 mb-6">
        <UploadZone onFilesAdded={onFilesAdded} />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <label className="font-label-mono text-label-mono text-on-surface-variant/50 px-2 mb-2 block uppercase tracking-widest">
            Library
          </label>
          <div className="space-y-4 px-2 mt-4">
            {documents.map((doc, i) => (
              <DocumentCard
                key={doc.id}
                name={doc.name}
                type={doc.type}
                status={doc.status}
                index={i}
                active={doc.id === activeDocId}
                onClick={() => onSelectDocument?.(doc.id)}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto px-2 pt-6">
        <button
          onClick={onNewResearch}
          className="w-full py-3 bg-primary-container text-on-primary-container font-label-mono text-label-mono rounded-sm shadow-inner hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Research
        </button>
      </div>
    </aside>
  )
}
