import io
from typing import Union

import pdfplumber
from docx import Document


def extract_text(file: Union[io.BytesIO, io.BufferedReader]) -> str:
    """
    Extract text from uploaded resume file (PDF or DOCX).
    """
    filename = getattr(file, "name", "")

    if filename.endswith(".pdf"):
        return _extract_pdf(file)

    elif filename.endswith(".docx"):
        return _extract_docx(file)

    else:
        raise ValueError("Unsupported file format. Only PDF and DOCX are allowed.")


def _extract_pdf(file) -> str:
    text = []
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            content = page.extract_text()
            if content:
                text.append(content)

    return "\n".join(text)


def _extract_docx(file) -> str:
    doc = Document(file)
    return "\n".join([para.text for para in doc.paragraphs if para.text])
