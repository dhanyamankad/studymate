"""
schemas.py — THE shared citation contract with the frontend.

Keep this in exact sync with the JSON shape documented in the project brief.
Nothing outside this file should construct the response payload by hand —
always build a QueryResponse and call .model_dump() so the shape is
structurally guaranteed, not just "usually right".
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Citations
# ---------------------------------------------------------------------------

class Citation(BaseModel):
    type: Literal["pdf", "image", "web"]
    label: str                      # e.g. "Lecture Notes.pdf", "whiteboard.jpg", "en.wikipedia.org"
    meta: str                       # e.g. "PAGE 12", "DIAGRAM", "LIVE SOURCE"
    excerpt: Optional[str] = None   # real retrieved text / web snippet, never invented
    thumbnail: Optional[str] = None # only used for image citations


class ReasoningStep(BaseModel):
    label: str                      # e.g. "INTERNAL REPOSITORY"
    text: str                       # e.g. "Checked Lecture Notes.pdf"
    active: bool = False
    source: Optional[str] = None    # optional quoted excerpt backing this step


class QueryResponse(BaseModel):
    answer: List[str] = Field(default_factory=list)
    citations: List[Citation] = Field(default_factory=list)
    reasoningSteps: List[ReasoningStep] = Field(default_factory=list)
    insufficient: bool = False      # explicit "I don't know" signal — see rag.py

    @classmethod
    def insufficient_response(cls, reasoning_steps: Optional[List[ReasoningStep]] = None) -> "QueryResponse":
        """
        The one and only way an empty-citation answer should be produced.
        Never let the model free-write "I don't know" prose with fabricated
        citations attached — this is the structural enforcement point.
        """
        return cls(
            answer=["I couldn't find this in your uploaded documents or the web search results."],
            citations=[],
            reasoningSteps=reasoning_steps or [],
            insufficient=True,
        )


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

class UploadResponse(BaseModel):
    status: Literal["ready", "error"]
    file_id: str
    filename: str
    type: Literal["pdf", "image"]
    chunks_indexed: int = 0
    detail: Optional[str] = None


# ---------------------------------------------------------------------------
# Query
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    question: str
    session_id: str
    web_search_enabled: bool = False
    document_ids: Optional[List[str]] = None
