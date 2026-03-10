# ============================================================
# PDF Processor — Text extraction with PyPDF2 / pdfplumber
# ============================================================

import os
from typing import List, Dict

# Try pdfplumber first (better accuracy), fall back to PyPDF2
try:
    import pdfplumber
    USE_PDFPLUMBER = True
except ImportError:
    import PyPDF2
    USE_PDFPLUMBER = False


def extract_text_from_pdf(file_path: str) -> List[Dict]:
    """
    Extract text page by page from a PDF.

    Returns:
        List of dicts: [{"page": 1, "text": "...content..."}, ...]
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF not found: {file_path}")

    pages = []

    if USE_PDFPLUMBER:
        pages = _extract_pdfplumber(file_path)
    else:
        pages = _extract_pypdf2(file_path)

    # Filter out empty/too-short pages
    pages = [p for p in pages if len(p["text"].strip()) > 50]
    return pages


def _extract_pdfplumber(file_path: str) -> List[Dict]:
    pages = []
    with pdfplumber.open(file_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            # Also extract tables as text if present
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    row_text = " | ".join([str(cell or "") for cell in row])
                    text += f"\n{row_text}"
            pages.append({"page": i + 1, "text": text.strip()})
    return pages


def _extract_pypdf2(file_path: str) -> List[Dict]:
    pages = []
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages.append({"page": i + 1, "text": text.strip()})
    return pages


def chunk_text(pages: List[Dict], chunk_size: int = 512, overlap: int = 50) -> List[Dict]:
    """
    Split page texts into overlapping chunks for embedding.

    Returns:
        List of dicts: [{"chunk_id": 0, "text": "...", "page": 1}, ...]
    """
    chunks = []
    chunk_id = 0

    for page_data in pages:
        text  = page_data["text"]
        words = text.split()
        start = 0

        while start < len(words):
            end       = min(start + chunk_size, len(words))
            chunk_txt = " ".join(words[start:end])
            chunks.append({
                "chunk_id": chunk_id,
                "text":     chunk_txt,
                "page":     page_data["page"],
            })
            chunk_id += 1
            start = end - overlap   # overlap for continuity

    return chunks
