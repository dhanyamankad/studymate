"""
OWNER: Dhanya
PURPOSE: Load PDFs from data/pdfs/, chunk them, embed, and persist to ChromaDB.

Run standalone to test: python ingest.py
"""

# TODO: from langchain_community.document_loaders import PyPDFLoader
# TODO: from langchain.text_splitter import RecursiveCharacterTextSplitter
# TODO: from langchain_community.embeddings import HuggingFaceEmbeddings
# TODO: from langchain_community.vectorstores import Chroma

PDF_DIR = "data/pdfs"
CHROMA_DIR = "chroma_store"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100


def load_and_chunk_pdfs(pdf_dir: str = PDF_DIR):
    """Load all PDFs in pdf_dir, split into chunks. Return list of chunks."""
    # TODO: implement
    raise NotImplementedError


def build_vectorstore(chunks):
    """Embed chunks and persist to ChromaDB at CHROMA_DIR."""
    # TODO: implement
    raise NotImplementedError


if __name__ == "__main__":
    chunks = load_and_chunk_pdfs()
    build_vectorstore(chunks)
    print(f"Indexed {len(chunks)} chunks into {CHROMA_DIR}")
