"""
main.py — FastAPI app, routes, CORS.

Thin routing layer only: file-type dispatch and turning
domain results into the response models. All real logic lives in
ingestion.py and rag.py.
"""

import os
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from schemas import QueryRequest, QueryResponse, UploadResponse
import ingestion
import rag

app = FastAPI(title="StudyMate Backend")

# CORS — Netlify frontend + local dev. Add your deployed Netlify URL here.
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.environ.get("FRONTEND_ORIGIN", ""),  # set this on Render to your Netlify URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PDF_EXTENSIONS = {".pdf"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


@app.get("/health")
def health():
    """Hit this once or twice before a demo to wake the Render free-tier
    instance up if it's spun down."""
    return {"status": "ok"}


@app.post("/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)):
    filename = file.filename or "upload"
    ext = os.path.splitext(filename)[1].lower()
    file_bytes = await file.read()
    document_id = str(uuid.uuid4())

    try:
        if ext in PDF_EXTENSIONS:
            n_chunks = ingestion.ingest_pdf(file_bytes, filename, document_id)
            file_type = "pdf"
        elif ext in IMAGE_EXTENSIONS:
            n_chunks = ingestion.ingest_image(file_bytes, filename, document_id)
            file_type = "image"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    except HTTPException:
        raise
    except Exception as e:
        return UploadResponse(
            status="error",
            file_id=document_id,
            filename=filename,
            type="pdf" if ext in PDF_EXTENSIONS else "image",
            chunks_indexed=0,
            detail=str(e),
        )

    return UploadResponse(
        status="ready",
        file_id=document_id,
        filename=filename,
        type=file_type,
        chunks_indexed=n_chunks,
    )


@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    return rag.answer_question(
        question=req.question,
        session_id=req.session_id,
        web_search_enabled=req.web_search_enabled,
        document_ids=req.document_ids,
    )
