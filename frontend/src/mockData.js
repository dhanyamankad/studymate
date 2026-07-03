/**
 * Mock exchange library — stand-in for the real FastAPI /query endpoint.
 *
 * Each exchange matches the citation JSON contract shared with the backend:
 *   { question, answer: string[], citations: Citation[], reasoningSteps: Step[] }
 *
 * pickMockExchange(question, webSearchEnabled) does simple keyword matching so
 * you can trigger different response shapes while testing the UI, without
 * needing a real backend running yet:
 *   - contains "unknown"        -> null (renders EmptyState)
 *   - contains "image"/"photo"  -> image-only citation
 *   - contains "web"/"search"   -> mixed pdf+web citations
 *   - contains "all"/"mixed"    -> pdf + image + web (kitchen sink)
 *   - anything else             -> the original quantum-entanglement demo
 *
 * Swap this whole file out once the real /query endpoint exists — App.jsx's
 * handleAsk just needs its setTimeout block replaced with a fetch() call that
 * returns the same shape.
 */

export const DEMO_EXCHANGE = {
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

const IMAGE_ONLY_EXCHANGE = {
  answer: [
    'The whiteboard diagram sketches a Bell-state circuit: two qubits pass through a Hadamard gate followed by a CNOT gate, producing one of the four maximally entangled Bell states.',
    'The annotation in the corner marks this as the |Φ+⟩ state, formed when both qubits start in |0⟩.',
  ],
  citations: [
    {
      type: 'image',
      label: 'Ref1.jpg',
      meta: 'DIAGRAM',
      excerpt: 'Handwritten annotation: "H -> CNOT -> |Φ+> Bell state (both qubits start |0>)"',
    },
  ],
  reasoningSteps: [
    { label: 'INTERNAL REPOSITORY', text: 'Checked uploaded images' },
    {
      label: 'VISION ANALYSIS',
      text: 'Parsed circuit diagram and handwritten annotation in Ref1.jpg',
      active: true,
      source: 'SOURCE: Ref1.jpg — whiteboard photo, uploaded this session.',
    },
  ],
}

const WEB_SEARCH_EXCHANGE = {
  answer: [
    "Your uploaded lecture notes cover the theoretical basis of Bell's inequality but don't mention the 2022 Nobel Prize, so I checked the web for that.",
    'The 2022 Nobel Prize in Physics was awarded to Alain Aspect, John Clauser, and Anton Zeilinger for experiments with entangled photons that confirmed violations of Bell inequalities.',
  ],
  citations: [
    {
      type: 'pdf',
      label: 'Lecture Notes.pdf',
      meta: 'PAGE 9',
      excerpt: '"Bell\'s inequality provides a testable boundary between local realism and quantum predictions."',
    },
    {
      type: 'web',
      label: 'nobelprize.org',
      meta: 'LIVE SOURCE',
      excerpt: '"The 2022 Nobel Prize in Physics recognizes pioneering experiments with entangled photons."',
    },
  ],
  reasoningSteps: [
    { label: 'INTERNAL REPOSITORY', text: "Checked Lecture Notes.pdf for Bell's inequality" },
    { label: 'GAP DETECTED', text: 'No mention of Nobel Prize recipients in local sources' },
    {
      label: 'EXTERNAL SEARCH',
      text: 'Queried web for "2022 Nobel Prize Physics entanglement"',
      active: true,
      source: 'SOURCE: nobelprize.org, official press release.',
    },
  ],
}

const ALL_SOURCES_EXCHANGE = {
  answer: [
    'Pulling this together from all three of your sources: your lecture notes define entanglement formally, the whiteboard photo shows the circuit that produces it experimentally, and a live web check confirms current terminology usage.',
    'All three agree on the core definition — correlated measurement outcomes that cannot be explained by pre-shared classical information.',
  ],
  citations: [
    {
      type: 'pdf',
      label: 'Lecture Notes.pdf',
      meta: 'PAGE 4',
      excerpt: '"...cannot be explained by any pre-shared classical information between the particles."',
    },
    {
      type: 'image',
      label: 'Ref1.jpg',
      meta: 'DIAGRAM',
      excerpt: 'Bell-state circuit diagram, hand-annotated with gate sequence.',
    },
    {
      type: 'web',
      label: 'en.wikipedia.org',
      meta: 'LIVE SOURCE SYNC',
      excerpt: '"Entangled particles exhibit correlations that cannot be explained by classical physics."',
    },
  ],
  reasoningSteps: [
    { label: 'INTERNAL REPOSITORY', text: 'Checked Lecture Notes.pdf and Ref1.jpg' },
    { label: 'CROSS-REFERENCE', text: 'Compared formal definition against whiteboard circuit' },
    {
      label: 'EXTERNAL SEARCH',
      text: 'Confirmed terminology against en.wikipedia.org',
      active: true,
      source: 'SOURCE: Wikipedia, "Quantum entanglement" article summary.',
    },
  ],
}

/**
 * Returns an exchange object (without `question` — caller attaches that),
 * or null to signal "no grounded answer found" -> render EmptyState.
 */
export function pickMockExchange(question, webSearchEnabled = false) {
  const q = question.toLowerCase()

  if (q.includes('unknown')) return null

  if (q.includes('image') || q.includes('photo') || q.includes('whiteboard')) {
    return IMAGE_ONLY_EXCHANGE
  }

  if (q.includes('all') || q.includes('mixed') || q.includes('everything')) {
    return ALL_SOURCES_EXCHANGE
  }

  if ((q.includes('web') || q.includes('search') || q.includes('nobel')) && webSearchEnabled) {
    return WEB_SEARCH_EXCHANGE
  }

  // Web-flavored question but web search toggle is off -> nothing grounds it
  if (q.includes('web') || q.includes('search') || q.includes('nobel')) {
    return null
  }

  return DEMO_EXCHANGE
}
