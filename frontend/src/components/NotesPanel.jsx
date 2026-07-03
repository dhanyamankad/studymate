import { useState } from 'react'

/**
 * Freeform notes tab — lets the user jot annotations alongside their
 * sources. Deliberately self-contained: all state lives here in memory
 * for the lifetime of the tab/page only.
 *
 * Per infra constraints (Render free tier, no persistent disk), this does
 * NOT write to localStorage, sessionStorage, or any backend endpoint.
 * Notes are lost on refresh/navigation away — that's expected, not a bug.
 * If persistent notes are wanted later, that needs a real datastore
 * (e.g. Postgres) behind a backend endpoint, not client-side storage.
 */

function makeBlankNote() {
  return {
    id: crypto.randomUUID(),
    title: '',
    content: '',
    updatedAt: Date.now(),
  }
}

export default function NotesPanel() {
  const [notes, setNotes] = useState([])

  function addNote() {
    const note = makeBlankNote()
    setNotes((prev) => [note, ...prev])
  }

  function updateNote(id, patch) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
    )
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="max-w-[900px] mx-auto px-page-margin py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="font-label-mono text-label-mono uppercase text-on-surface-variant tracking-widest mb-1">
            Notes
          </h3>
          <p className="font-body-md text-sm text-on-surface-variant/60">
            Freeform annotations for this session — not saved once you leave.
          </p>
        </div>
        <button
          onClick={addNote}
          className="text-primary font-label-mono text-[10px] uppercase border-b border-primary/30 hover:border-primary transition-all shrink-0"
        >
          New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="parchment-grain bg-tertiary text-on-tertiary p-12 rounded-xl shadow-2xl border-2 border-dashed border-outline-variant/40 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-2xl">edit_note</span>
            </div>
            <p className="font-body-md text-on-tertiary-container/70 max-w-sm mx-auto leading-relaxed">
              No notes yet this session. Jot down a thought, a citation to revisit, or a
              question for later.
            </p>
            <button
              onClick={addNote}
              className="mt-2 px-4 py-2 bg-primary-container text-on-primary-container font-label-mono text-[10px] uppercase rounded-sm shadow-inner hover:brightness-110 transition-all"
            >
              Start a note
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note, i) => {
            const rotation = ['-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1'][i % 4]
            return (
              <div
                key={note.id}
                className={`group relative bg-tertiary parchment-grain p-5 rounded-lg text-on-tertiary shadow-lg transition-transform duration-300 hover:rotate-0 hover:scale-[1.01] ${rotation}`}
              >
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-on-tertiary/50 hover:text-on-tertiary"
                  title="Delete note"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>

                <input
                  value={note.title}
                  onChange={(e) => updateNote(note.id, { title: e.target.value })}
                  placeholder="Untitled note"
                  className="w-full bg-transparent font-headline-md text-lg leading-tight mb-2 pr-6 outline-none placeholder:text-on-tertiary/40"
                />

                <textarea
                  value={note.content}
                  onChange={(e) => updateNote(note.id, { content: e.target.value })}
                  placeholder="Start writing..."
                  rows={6}
                  className="w-full bg-transparent font-body-md text-sm opacity-90 outline-none resize-none placeholder:text-on-tertiary/40 leading-relaxed"
                />

                <div className="pt-3 mt-3 border-t border-on-tertiary/10 flex items-center justify-between">
                  <span className="font-label-mono text-[10px] uppercase">
                    {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-label-mono text-[10px] uppercase">Session Only</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
