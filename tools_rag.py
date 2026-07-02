"""
OWNER: Dhanya
PURPOSE: Expose a search_documents() tool that agent.py (Vanshi's file) will import.

CONTRACT (do not change without telling Vanshi):
    search_documents(query: str) -> str
    Returns relevant chunks as a single formatted string, including source page numbers.
"""

# TODO: from langchain_community.vectorstores import Chroma
# TODO: from langchain_community.embeddings import HuggingFaceEmbeddings
# TODO: from langchain.tools import tool

CHROMA_DIR = "chroma_store"


def search_documents(query: str) -> str:
    """
    Search the indexed PDF documents for relevant content.
    Must return source attribution (e.g. filename + page number) inline in the string.
    """
    # TODO: implement
    raise NotImplementedError


if __name__ == "__main__":
    # Quick manual test once implemented:
    print(search_documents("test question about your uploaded PDF"))
