"""
ingestion.py — PDF/image -> chunks -> embeddings -> Chroma.

The #1 citation-integrity rule lives here: page_number (for PDFs) and
source_file (for both types) are attached at ingestion time as real
metadata. Nothing downstream is allowed to "remember" or regenerate this
from model output.
"""

import io
import uuid
from typing import List, Dict, Any

import fitz  # PyMuPDF
from PIL import Image

from rag import get_chroma_collection, embed_texts, describe_image_with_gemini

CHUNK_SIZE = 1000       # characters
CHUNK_OVERLAP = 150


def _split_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Hand-rolled recursive-ish splitter. Swap for LangChain's
    RecursiveCharacterTextSplitter later if you want smarter boundaries."""
    text = text.strip()
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end]
        chunks.append(chunk)
        if end == len(text):
            break
        start = end - overlap
    return chunks


def ingest_pdf(file_bytes: bytes, filename: str, document_id: str) -> int:
    """
    Extract text per-page (page number is first-class, never inferred later),
    chunk each page independently so a chunk never straddles two pages,
    embed, and store in Chroma with {text, source_file, page_number, type}.
    Returns number of chunks indexed.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    records: List[Dict[str, Any]] = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        page_number = page_index + 1  # human-facing, 1-indexed
        page_text = page.get_text()
        for chunk_text in _split_text(page_text):
            records.append({
                "id": str(uuid.uuid4()),
                "text": chunk_text,
                "source_file": filename,
                "page_number": page_number,
                "type": "pdf",
                "document_id": document_id,
            })
    doc.close()

    if not records:
        return 0

    _embed_and_store(records)
    return len(records)


def ingest_image(file_bytes: bytes, filename: str, document_id: str) -> int:
    """
    Preprocess with Pillow, describe with Gemini Vision, store the
    description as a single retrievable chunk tagged back to the
    originating filename. Image citations never get flattened into
    generic PDF-shaped context.
    """
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img.thumbnail((1600, 1600))  # normalize size before sending to Gemini

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    normalized_bytes = buf.getvalue()

    description = describe_image_with_gemini(normalized_bytes, filename)

    record = {
        "id": str(uuid.uuid4()),
        "text": description,
        "source_file": filename,
        "page_number": None,
        "type": "image",
        "document_id": document_id,
    }
    _embed_and_store([record])
    return 1


def _embed_and_store(records: List[Dict[str, Any]]) -> None:
    collection = get_chroma_collection()
    texts = [r["text"] for r in records]
    embeddings = embed_texts(texts)

    collection.add(
        ids=[r["id"] for r in records],
        embeddings=embeddings,
        documents=texts,
        metadatas=[
            {
                "source_file": r["source_file"],
                "page_number": r["page_number"] if r["page_number"] is not None else -1,
                "type": r["type"],
                "document_id": r["document_id"],
            }
            for r in records
        ],
    )
