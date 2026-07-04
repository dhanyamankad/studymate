# StudyMate Backend

FastAPI + ChromaDB + Gemini RAG pipeline. Owns `/upload` and `/query`,
enforces the citation JSON contract structurally via Pydantic.

## Setup

**Requires Python 3.14+.**

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in GEMINI_API_KEY and TAVILY_API_KEY
```

Get keys (both free, no card):
- Gemini: https://aistudio.google.com/app/apikey
- Tavily: https://app.tavily.com

## Run locally

```bash
uvicorn main:app --reload --port 8000
```

- Health check: `GET http://localhost:8000/health`
- Interactive docs: `http://localhost:8000/docs`

Set `VITE_API_URL` in the frontend's `.env.local` to this URL (or the Render URL
once deployed) to connect the frontend to this backend.

## Endpoints

- `POST /upload` — multipart file upload (`.pdf`, `.png/.jpg/.jpeg/.webp/.gif`).
  Runs extraction → chunking → embedding → Chroma storage. Returns
  `UploadResponse` (status/file_id/chunks_indexed).
- `POST /query` — body: `{ question, session_id, web_search_enabled, document_ids? }`.
  Runs retrieval → optional Tavily web search → Gemini structured synthesis.
  Returns the citation `QueryResponse` contract (see `schemas.py`). If
  sources are insufficient, `insufficient: true` and `citations: []` —
  the frontend's EmptyState should key off this rather than empty prose.

## Deploy (Render free tier)

1. New Web Service → connect the repo → root/start command:
   `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
2. Add env vars: `GEMINI_API_KEY`, `TAVILY_API_KEY`, `FRONTEND_ORIGIN` (your Netlify URL).
3. Free tier spins down after ~15 min idle — hit `/health` once or twice
   before the live demo to wake it up.

## Notes / known trade-offs

- Session memory is a plain in-memory dict (`rag.py: SESSIONS`) — resets
  on every Render restart/redeploy. Fine for a hackathon demo; swap for
  Redis if there's time.
- Chunking is a hand-rolled character splitter (`ingestion.py`). Swap in
  LangChain's `RecursiveCharacterTextSplitter` if you want smarter
  sentence/paragraph boundaries.
- Multi-document mode: `/upload` returns a `file_id` per document; pass a
  list of those as `document_ids` in `/query` to scope retrieval.
