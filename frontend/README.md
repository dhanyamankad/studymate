# StudyMate UI — "Nocturnal Scholar"

A Vite + React + Tailwind implementation of the StudyMate frontend, converted by hand
from the Stitch-generated HTML screens (React export wasn't available, so this was
rebuilt component-by-component to match the original design system exactly).

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a production build in `dist/`,
ready to deploy to Netlify.

## Structure

```
src/
  components/
    GlowOrb.jsx         The companion's ambient presence — a real WebGL shader,
                         mounted once via useRef/useEffect so React re-renders
                         elsewhere never restart or tear down the canvas.
    Sidebar.jsx          Library / document bookshelf + "New Research" button
    DocumentCard.jsx     Single tilted "physical paper" document card
    AnswerCard.jsx       The parchment "notebook page" answer surface
    CitationBadge.jsx    Torn-paper citation tag (pdf / image / web variants)
    ReasoningTrace.jsx   Collapsed line -> expandable step-by-step timeline
    EmptyState.jsx       Zero-hallucination fallback (dashed border, honest copy)
    InputBar.jsx         Fountain-pen input + "Reach Beyond" web-search toggle
  App.jsx                Wires everything together; currently uses mocked
                          responses in `handleAsk` — replace with a real call
                          to your FastAPI backend.
  index.css              Design tokens' custom CSS: torn-edge mask, parchment
                          grain, ink-bleed focus line, analog switch, watercolor
                          pulse animation, reduced-motion overrides.
tailwind.config.js        Full Material Design 3–style color/type/spacing token
                           system extracted from the Stitch export.
```

## Wiring to the backend

Replace the `setTimeout` mock in `App.jsx`'s `handleAsk` with a real fetch to your
FastAPI `/query` endpoint. The expected shape already matches your citation contract:

```js
{
  question: string,
  answer: string[],           // paragraphs
  citations: [
    { type: 'pdf' | 'image' | 'web', label: string, meta?: string, thumbnail?: string }
  ],
  reasoningSteps: [
    { label: string, text: string, active?: boolean, source?: string }
  ]
}
```

If the backend returns no grounded citations, set `showEmpty(true)` instead of
rendering an `AnswerCard` — this triggers the zero-hallucination `EmptyState`.

## What's implemented

- **Core flow**: ask a question -> thinking state (orb + watercolor wash) -> answer
  with citations and expandable reasoning trace, or the zero-hallucination empty state.
- **Citation flip-to-reveal**: `CitationBadge` is a real 3D flip card (CSS
  `perspective` + `backface-visibility`) — clicking flips it to show the exact
  excerpt behind the claim, not just a callback.
- **Mobile bookshelf**: `MobileDocumentStrip` renders a horizontal, snap-scrolling
  strip of document cards below `md`, replacing the desktop `Sidebar`. The companion
  glow orb already lives in `InputBar`, which is shared across breakpoints, so it
  naturally sits above the input line on mobile too.
- **Multi-document source selection**: `SourcesPanel`, reachable from the "Resources"
  nav tab, shows every active source as a card — the one currently referenced is
  lifted, starred, and ring-glowing; the rest sit tilted and dimmed. Selecting a card
  updates the shared `activeDocId` used by the sidebar/mobile strip too.

## Known follow-ups

- Session timeline rail (right-hand dots) is static; wire to real exchange history when
  multi-turn memory is added on the backend.
- "Notes" nav tab is a placeholder — not part of the original judging rubric, left as
  a stub rather than removed since Stitch's nav included it.
