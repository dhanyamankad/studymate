import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MobileDocumentStrip from './components/MobileDocumentStrip'
import AnswerCard from './components/AnswerCard'
import EmptyState from './components/EmptyState'
import InputBar from './components/InputBar'
import SourcesPanel from './components/SourcesPanel'

const INITIAL_DOCS = [
  { id: 'doc1', name: 'Lecture Notes.pdf', type: 'pdf', status: 'ready' },
  { id: 'doc2', name: 'Ref1.jpg', type: 'image', status: 'ready' },
  { id: 'doc3', name: 'Quantum_Ch1.pdf', type: 'article', status: 'ready' },
]

const SOURCES = [
  {
    id: 'doc1',
    type: 'pdf',
    title: 'Lecture Notes.pdf',
    description: 'Week 6 lecture covering entanglement, superposition, and measurement.',
    relevance: '98.2% RELEVANCE',
    sourceLabel: 'PDF SOURCE',
  },
  {
    id: 'doc2',
    type: 'image',
    title: 'Ref1.jpg',
    description: 'Photographed whiteboard diagram of a Bell-state circuit.',
    relevance: '34 SIGHTINGS',
    sourceLabel: 'IMAGE SOURCE',
  },
  {
    id: 'doc3',
    type: 'pdf',
    title: 'Quantum_Ch1.pdf',
    description: 'Chapter 1 textbook scan: foundations of quantum mechanics.',
    relevance: 'UPDATED 2D AGO',
    sourceLabel: 'PDF SOURCE',
  },
  {
    id: 'web1',
    type: 'web',
    title: 'Wikipedia: Quantum Entanglement',
    description: 'Live web reference, pulled when local sources were insufficient.',
    relevance: 'LIVE WEB SOURCE',
    sourceLabel: 'WEB SOURCE',
  },
]

const DEMO_EXCHANGE = {
  question: 'What are the core principles of quantum entanglement?',
  answer: [
    'Quantum entanglement is a physical phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle of the group cannot be described independently of the state of the others, including when the particles are separated by a large distance.',
    'At its core, entanglement implies that measurements of physical properties such as position, momentum, spin, and polarization performed on entangled particles can be found to be perfectly correlated.',
    'This phenomenon was famously referred to by Albert Einstein as "spooky action at a distance." According to the Copenhagen interpretation of quantum mechanics, their shared state is indeterminate until a measurement is made.',
  ],
  citations: [
    {
      type: 'pdf',
      label: 'Lecture Notes.pdf',
      meta: 'PAGE 4',
      excerpt:
        '"...measurements of position, momentum, spin, and polarization performed on entangled particles are found to be perfectly correlated, regardless of separation distance."',
    },
    {
      type: 'pdf',
      label: 'Quantum_Ch1.pdf',
      meta: 'SEC 2.3',
      excerpt:
        '"Einstein referred to this correlation as \'spooky action at a distance,\' expressing discomfort with its non-local implications."',
    },
    {
      type: 'web',
      label: 'en.wikipedia.org',
      meta: 'LIVE SOURCE SYNC',
      excerpt:
        '"Under the Copenhagen interpretation, the shared quantum state remains indeterminate until a measurement is performed on one of the particles."',
    },
  ],
  reasoningSteps: [
    { label: 'INTERNAL REPOSITORY', text: 'Checked Lecture Notes.pdf' },
    { label: 'ANALYSIS', text: 'Found direct match, cross-referencing Quantum_Ch1.pdf' },
    {
      label: 'EXTERNAL SEARCH',
      text: 'Verified terminology against en.wikipedia.org',
      active: true,
      source: "SOURCE: 'Spooky action at a distance' — Einstein-Podolsky-Rosen paradox, 1935.",
    },
  ],
}

const NAV_TABS = ['Focus', 'Resources', 'Notes']

/**
 * Demo shell wiring together the full flow: ask -> thinking -> answer/empty,
 * plus the Resources tab (multi-document source selection) and the mobile
 * horizontal bookshelf. Replace the mocked response in `handleAsk` with a
 * real call to the FastAPI backend when it's ready.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('Focus')
  const [activeDocId, setActiveDocId] = useState('doc1')
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [exchange, setExchange] = useState(DEMO_EXCHANGE)
  const [showEmpty, setShowEmpty] = useState(false)
  const [documents, setDocuments] = useState(INITIAL_DOCS)

  // Called by UploadZone (via Sidebar) whenever the user drops/picks files.
  // TEMP: fakes the processing -> ready transition with a timeout. Once the
  // FastAPI /upload endpoint exists, replace the setTimeout block below with
  // a real fetch(..., { method: 'POST', body: formData }) call per file, and
  // flip status to 'ready' only after that call actually succeeds.
  function handleFilesAdded(files) {
    const newDocs = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type === 'application/pdf' ? 'pdf' : 'image',
      status: 'processing',
    }))
    setDocuments((prev) => [...prev, ...newDocs])

    newDocs.forEach((doc) => {
      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: 'ready' } : d))
        )
      }, 1200 + Math.random() * 800)
    })
  }

  function handleAsk(question) {
    setActiveTab('Focus')
    setShowEmpty(false)
    setThinking(true)

    // Placeholder — replace with a real call to the FastAPI /query endpoint.
    setTimeout(() => {
      setThinking(false)
      if (question.toLowerCase().includes('unknown')) {
        setShowEmpty(true)
      } else {
        setExchange({ ...DEMO_EXCHANGE, question })
      }
    }, 1400)
  }

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelectDocument={setActiveDocId}
        onFilesAdded={handleFilesAdded}
        onNewResearch={() => {
          setShowEmpty(false)
          setActiveTab('Focus')
          setExchange(DEMO_EXCHANGE)
        }}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 w-full max-w-[1100px] mx-auto flex items-center justify-between px-page-margin shrink-0">
          <div className="flex items-center gap-8">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-label-mono text-label-mono pb-1 transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <MobileDocumentStrip
          documents={documents}
          activeDocId={activeDocId}
          onSelectDocument={setActiveDocId}
        />

        <div className="flex-1 overflow-y-auto pb-48">
          {activeTab === 'Resources' ? (
            <SourcesPanel
              sources={SOURCES}
              activeSourceId={activeDocId}
              onSelectSource={setActiveDocId}
              onAddResource={() => {}}
            />
          ) : activeTab === 'Notes' ? (
            <div className="max-w-[800px] mx-auto px-page-margin py-16 text-center text-on-surface-variant font-body-md">
              <p>Personal notes aren't wired up yet — this tab is reserved for freeform annotations alongside your sources.</p>
            </div>
          ) : (
            <div className="max-w-[800px] mx-auto px-page-margin pt-8 relative">
              {showEmpty ? <EmptyState /> : <AnswerCard exchange={{ ...exchange, thinking }} />}
            </div>
          )}
        </div>

        <InputBar
          onSubmit={handleAsk}
          thinking={thinking}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={setWebSearchEnabled}
        />
      </main>

      <aside className="w-16 h-full flex flex-col items-center py-8 gap-8 border-l border-outline-variant/10 z-20 shrink-0 hidden lg:flex">
        <div className="w-px h-16 bg-gradient-to-b from-transparent to-outline-variant/30" />
        <div className="flex flex-col gap-4">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,217,167,0.5)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/40 hover:bg-primary transition-colors cursor-pointer" />
          <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/40 hover:bg-primary transition-colors cursor-pointer" />
        </div>
      </aside>
    </div>
  )
}
