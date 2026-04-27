import io
from typing import Union

import pdfplumber
from docx import Document


def extract_text(file: Union[io.BytesIO, io.BufferedReader], filename: str) -> str:
    """
    Extract text from uploaded resume file (PDF or DOCX).
    """
    if filename.lower().endswith(".pdf"):
        return _extract_pdf(file)
    elif filename.lower().endswith(".docx"):
        return _extract_docx(file)

    else:
        raise ValueError("Unsupported file format. Only PDF and DOCX are allowed.")


def _extract_pdf(file) -> str:
    text = []
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                try:
                    content = page.extract_text()
                    if content:
                        text.append(content)
                except Exception as e:
                    # Handle font or extraction errors for individual pages
                    print(f"Warning: Could not extract text from page: {e}")
                    try:
                        # Try alternative extraction method
                        content = page.extract_text(layout=False)
                        if content:
                            text.append(content)
                    except Exception:
                        pass  # Skip this page if alternative fails

        return "\n".join(text) if text else ""
    except Exception as e:
        raise ValueError(f"Failed to extract PDF: {str(e)}")


def _extract_docx(file) -> str:
    doc = Document(file)
    return "\n".join([para.text for para in doc.paragraphs if para.text])
