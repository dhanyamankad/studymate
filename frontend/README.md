# StudyMate UI — "Nocturnal Scholar"

A Vite + React + Tailwind implementation of the StudyMate frontend, converted by hand
from the Stitch-generated HTML screens (React export wasn't available, so this was
rebuilt component-by-component to match the original design system exactly).

## Run it

```bash
npm install
cp .env.example .env.local   # set VITE_API_URL to your backend (see below)
npm run dev
```

Then open the printed local URL. `npm run build` produces a production build in `dist/`,
ready to deploy to Netlify (see `netlify.toml`).

## Structure

```
src/
  api.js                Real backend client for POST /upload and POST /query.
                         Throws on any failure (network error, timeout, non-2xx,
                         malformed shape, or an explicit error signal in the
                         response body) — no mock fallback.
  components/
    GlowOrb.jsx         The companion's ambient presence — a real WebGL shader,
                         mounted once via useRef/useEffect so React re-renders
                         elsewhere never restart or tear down the canvas.
    Sidebar.jsx          Library / document bookshelf + "New Research" button
    UploadZone.jsx        Real drag-and-drop / click-to-pick file upload
    DocumentCard.jsx     Single tilted "physical paper" document card
    MobileDocumentStrip.jsx  Mobile equivalent of Sidebar, with its own UploadZone
    AnswerCard.jsx       The parchment "notebook page" answer surface
    CitationBadge.jsx    Torn-paper citation tag (pdf / image / web variants)
    ReasoningTrace.jsx   Collapsed line -> expandable step-by-step timeline
    SourcesPanel.jsx     "Resources" tab — every uploaded/ready source plus any
                         web citations pulled in by the latest answer
    EmptyState.jsx       Two distinct quiet states: "no-answer" (zero-hallucination
                         fallback) and "error" (backend unreachable/misconfigured/failed)
    InputBar.jsx         Fountain-pen input + "Reach Beyond" web-search toggle
  App.jsx                Wires everything together — uploads, queries, the Resources
                         tab, and a session-scoped Notes tab — talking only to the
                         real FastAPI backend via api.js. No mock/demo data.
  index.css              Design tokens' custom CSS: torn-edge mask, parchment
                          grain, ink-bleed focus line, analog switch, watercolor
                          pulse animation, reduced-motion overrides.
tailwind.config.js        Full Material Design 3–style color/type/spacing token
                           system extracted from the Stitch export.
```

## Wiring to the backend

Set `VITE_API_URL` in `.env.local` (or as a Netlify env var for the deployed
site) to your running FastAPI backend's base URL. If it's unset, `api.js`'s
`isBackendConfigured()` returns false and `App.jsx` shows a real error state
rather than a fabricated answer — there is no mock mode to fall back to.

Request/response shapes are documented in `src/api.js` and match
`backend/schemas.py` exactly:

```js
// POST /query response
{
  answer: string[],           // paragraphs
  citations: [
    { type: 'pdf' | 'image' | 'web', label: string, meta?: string, excerpt?: string, thumbnail?: string }
  ],
  reasoningSteps: [
    { label: string, text: string, active?: boolean, source?: string }
  ],
  insufficient: boolean       // true -> queryBackend() resolves to null -> EmptyState
}
```

## What's implemented

- **Core flow**: ask a question -> thinking state (orb + watercolor wash) -> answer
  with citations and expandable reasoning trace, or an EmptyState (either the
  zero-hallucination "no answer found" variant, or a distinct "error" variant for
  real failures).
- **Real uploads**: `UploadZone` (desktop sidebar + mobile strip) does real
  drag-and-drop/click-to-pick uploads against `POST /upload`, scoped by a stable
  per-session `session_id` generated in `App.jsx`. Upload status (processing/ready/error)
  is reflected live on each `DocumentCard`.
- **Resources tab**: `SourcesPanel` is built entirely from real state — ready uploaded
  documents plus any web citations from the most recent answer. No hardcoded entries.
- **Notes tab**: real session-scoped note-taking (add/edit/delete), kept client-side
  only and never sent to the AI or indexed for retrieval.
- **Citation flip-to-reveal**: `CitationBadge` is a real 3D flip card (CSS
  `perspective` + `backface-visibility`) — clicking flips it to show the exact
  excerpt behind the claim.
- **Mobile bookshelf**: `MobileDocumentStrip` renders a horizontal, snap-scrolling
  strip of document cards below `md`, replacing the desktop `Sidebar`. The companion
  glow orb already lives in `InputBar`, which is shared across breakpoints, so it
  naturally sits above the input line on mobile too.
- **Multi-document source selection**: `SourcesPanel`, reachable from the "Resources"
  nav tab, shows every active source as a card — the one currently referenced is
  lifted, starred, and ring-glowing; the rest sit tilted and dimmed. Selecting a card
  updates the shared `activeDocId` used by the sidebar/mobile strip too.

## Known follow-ups

- Session timeline rail (the small right-hand dots in `App.jsx`) is purely
  decorative — it isn't wired to real exchange history. Hook it up if/when
  multi-turn history becomes user-visible beyond the answer card itself.
