"""
rag.py — retrieval + Gemini call + function calling + citation enforcement.

Everything that talks to Gemini or Chroma lives here so main.py stays a
thin routing layer and ingestion.py stays a thin extraction layer.
"""

import os
import json
from typing import List, Dict, Any, Optional

import chromadb
from google import genai
from google.genai import types
from tavily import TavilyClient

from schemas import QueryResponse, Citation, ReasoningStep

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY")

genai_client = genai.Client(api_key=GEMINI_API_KEY)
tavily_client = TavilyClient(api_key=TAVILY_API_KEY) if TAVILY_API_KEY else None

_chroma_client = chromadb.PersistentClient(path="./chroma_data")
_COLLECTION_NAME = "studymate_chunks"

EMBED_MODEL = "gemini-embedding-001"
LLM_MODEL = "gemini-2.5-flash"

# In-memory session store, keyed by session_id -> list of {role, content}.
# Fine for a single instance; swap for Redis for multi-instance/persistent
# deployments.
SESSIONS: Dict[str, List[Dict[str, str]]] = {}


def get_chroma_collection():
    return _chroma_client.get_or_create_collection(name=_COLLECTION_NAME)


def embed_texts(texts: List[str]) -> List[List[float]]:
    result = genai_client.models.embed_content(
        model=EMBED_MODEL,
        contents=texts,
    )
    return [e.values for e in result.embeddings]


def describe_image_with_gemini(image_bytes: bytes, filename: str) -> str:
    """Used by ingestion.py at upload time to turn a whiteboard/notes photo
    into retrievable text, tagged with its own filename."""
    response = genai_client.models.generate_content(
        model=LLM_MODEL,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
            f"Transcribe and describe the academic content in this image "
            f"(filename: {filename}). Include any diagrams, equations, or "
            f"handwritten notes verbatim where legible.",
        ],
    )
    return response.text or ""


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

def retrieve(question: str, document_ids: Optional[List[str]] = None, n_results: int = 5) -> List[Dict[str, Any]]:
    collection = get_chroma_collection()
    if collection.count() == 0:
        return []

    query_embedding = embed_texts([question])[0]

    where = {"document_id": {"$in": document_ids}} if document_ids else None

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=where,
    )

    matches = []
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    dists = results.get("distances", [[]])[0]
    for text, meta, dist in zip(docs, metas, dists):
        matches.append({"text": text, "meta": meta, "distance": dist})
    return matches


# ---------------------------------------------------------------------------
# Web search (Tavily function-calling tool)
# ---------------------------------------------------------------------------

def web_search(query: str, max_results: int = 3) -> List[Dict[str, str]]:
    if not tavily_client:
        return []
    response = tavily_client.search(query=query, max_results=max_results)
    return [
        {
            "url": r.get("url", ""),
            "title": r.get("title", r.get("url", "")),
            "content": r.get("content", ""),
        }
        for r in response.get("results", [])
    ]


# ---------------------------------------------------------------------------
# Synthesis
# ---------------------------------------------------------------------------

_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "answer": {"type": "array", "items": {"type": "string"}},
        "used_source_indices": {
            "type": "array",
            "items": {"type": "integer"},
            "description": "Indices into the provided SOURCES list that were actually used to answer. Empty if none were sufficient.",
        },
        "insufficient": {"type": "boolean"},
    },
    "required": ["answer", "used_source_indices", "insufficient"],
}

_SYSTEM_INSTRUCTION = (
    "You are StudyMate, a study assistant. You will be given numbered SOURCES "
    "(pulled from the student's uploaded PDFs/images, and optionally live web "
    "search results) and a QUESTION. Answer ONLY using those sources. "
    "Return which source indices you actually relied on in used_source_indices. "
    "If the sources do not contain enough information to answer confidently, "
    "set insufficient=true, used_source_indices=[], and give a short answer "
    "explaining you don't have enough information — do NOT guess or use "
    "outside knowledge."
)


def _build_sources_block(retrieved: List[Dict[str, Any]], web_results: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    sources = []
    for r in retrieved:
        sources.append({
            "kind": "pdf" if r["meta"]["type"] == "pdf" else "image",
            "source_file": r["meta"]["source_file"],
            "page_number": r["meta"].get("page_number"),
            "text": r["text"],
        })
    for w in web_results:
        sources.append({
            "kind": "web",
            "url": w["url"],
            "title": w["title"],
            "text": w["content"],
        })
    return sources


def synthesize(question: str, session_id: str, retrieved: List[Dict[str, Any]],
                web_results: List[Dict[str, str]]) -> QueryResponse:

    sources = _build_sources_block(retrieved, web_results)
    reasoning_steps: List[ReasoningStep] = []

    if retrieved:
        reasoning_steps.append(ReasoningStep(
            label="INTERNAL REPOSITORY",
            text=f"Checked {len(retrieved)} chunk(s) from uploaded documents",
            active=False,
        ))
    if web_results:
        reasoning_steps.append(ReasoningStep(
            label="WEB SEARCH",
            text=f"Retrieved {len(web_results)} live result(s) via Tavily",
            active=False,
        ))

    if not sources:
        reasoning_steps.append(ReasoningStep(
            label="RESULT",
            text="No relevant sources found in documents or web search",
            active=True,
        ))
        return QueryResponse.insufficient_response(reasoning_steps)

    history = SESSIONS.get(session_id, [])
    numbered_sources = "\n\n".join(
        f"[{i}] ({s['kind']}) "
        f"{s.get('source_file') or s.get('url')}"
        f"{' p.' + str(s['page_number']) if s.get('page_number') else ''}\n{s['text']}"
        for i, s in enumerate(sources)
    )
    history_text = "\n".join(f"{h['role']}: {h['content']}" for h in history[-6:])

    prompt = (
        f"CONVERSATION HISTORY:\n{history_text}\n\n"
        f"SOURCES:\n{numbered_sources}\n\n"
        f"QUESTION: {question}"
    )

    response = genai_client.models.generate_content(
        model=LLM_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=_RESPONSE_SCHEMA,
        ),
    )

    try:
        parsed = json.loads(response.text)
    except (json.JSONDecodeError, TypeError):
        # Model failed to return valid structured output — fail safe,
        # never fabricate citations to paper over a parsing error.
        reasoning_steps.append(ReasoningStep(
            label="RESULT",
            text="Model response could not be parsed as structured output",
            active=True,
        ))
        return QueryResponse.insufficient_response(reasoning_steps)

    if parsed.get("insufficient") or not parsed.get("used_source_indices"):
        reasoning_steps.append(ReasoningStep(
            label="RESULT",
            text="Sources present but insufficient to answer confidently",
            active=True,
        ))
        return QueryResponse.insufficient_response(reasoning_steps)

    citations: List[Citation] = []
    for idx in parsed["used_source_indices"]:
        if idx < 0 or idx >= len(sources):
            continue  # never trust an out-of-range index from the model
        s = sources[idx]
        if s["kind"] == "pdf":
            citations.append(Citation(
                type="pdf",
                label=s["source_file"],
                meta=f"PAGE {s['page_number']}" if s.get("page_number") else "PDF",
                excerpt=s["text"][:400],
            ))
        elif s["kind"] == "image":
            citations.append(Citation(
                type="image",
                label=s["source_file"],
                meta="DIAGRAM",
                excerpt=s["text"][:400],
            ))
        else:  # web
            citations.append(Citation(
                type="web",
                label=s.get("url", s.get("title", "")),
                meta="LIVE SOURCE",
                excerpt=s["text"][:400],
            ))

    reasoning_steps.append(ReasoningStep(
        label="RESULT",
        text=f"Answered using {len(citations)} source(s)",
        active=True,
    ))

    SESSIONS.setdefault(session_id, [])
    SESSIONS[session_id].append({"role": "user", "content": question})
    SESSIONS[session_id].append({"role": "assistant", "content": " ".join(parsed["answer"])})

    return QueryResponse(
        answer=parsed["answer"],
        citations=citations,
        reasoningSteps=reasoning_steps,
        insufficient=False,
    )


def answer_question(question: str, session_id: str, web_search_enabled: bool,
                     document_ids: Optional[List[str]] = None) -> QueryResponse:
    retrieved = retrieve(question, document_ids=document_ids)
    web_results = web_search(question) if web_search_enabled else []
    return synthesize(question, session_id, retrieved, web_results)
