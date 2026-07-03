# StudyMate — Hybrid AI Study Companion

A hackathon project that ingests scattered study material — PDF lecture notes, photos
of handwritten/whiteboard notes, and live web sources — and answers student questions
with grounded, explicitly-cited responses. Built to satisfy strict citation and
zero-hallucination requirements: every answer traces back to a document page, an
image, or a web URL, or the system says "I don't know."

## Team

| Member | Role |
|---|---|
| Dhanya | Frontend & UI (React/Tailwind, deployed on Netlify) |
| Vanshi | Backend & AI orchestration (FastAPI, ChromaDB, Gemini RAG pipeline, web search grounding) |

## Architecture

```
frontend/   React + Vite + Tailwind — chat UI, citation badges, reasoning trace,
            document upload. Deploys to Netlify.
backend/    FastAPI + ChromaDB + Gemini 2.5 Flash — ingestion, RAG retrieval,
            multimodal reasoning, structured citation output. Deploys to Render.
```

**Stack**
- **LLM**: Gemini 2.5 Flash (multimodal — text + vision + function calling)
- **Embeddings**: Gemini `text-embedding-004`
- **Vector store**: ChromaDB (self-hosted, persistent mode)
- **Web search grounding**: Tavily API
- **PDF parsing**: PyMuPDF (preserves page numbers for citation)
- **Backend**: FastAPI + Pydantic (structured JSON output enforces citation schema)
- **Frontend**: React + Vite + Tailwind

All tools used are free-tier, no card required — see `backend/README.md` (once added)
for API key setup.

## Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
git clone https://github.com/<your-username>/studymate.git
cd studymate
python -m venv venv
venv\Scripts\activate      # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```
You'll need a `.env` file in `backend/` with your Gemini and Tavily API keys — see
`backend/.env.example` once it's added.

## Citation contract

The backend must return responses in this shape so the frontend's citation badges and
zero-hallucination fallback render correctly:

```json
{
  "answer": ["paragraph 1", "paragraph 2"],
  "citations": [
    { "type": "pdf", "label": "Lecture Notes.pdf", "meta": "PAGE 12", "excerpt": "..." },
    { "type": "image", "label": "whiteboard.jpg", "meta": "DIAGRAM", "thumbnail": "url" },
    { "type": "web", "label": "en.wikipedia.org", "meta": "LIVE SOURCE", "excerpt": "..." }
  ],
  "reasoningSteps": [
    { "label": "INTERNAL REPOSITORY", "text": "Checked Lecture Notes.pdf" }
  ]
}
```

If no grounded citations can be produced, the backend should signal this explicitly so
the frontend renders the zero-hallucination state rather than a hallucinated answer.

## Branches

- `main` — stable/demo-ready code only
- `dhanya` — frontend work
- `vanshi` — backend work
## Team
- Dhanya — RAG, document ingestion & deployment
- Vanshi — Agent, vision & UI
