from typing import List

from openai import OpenAI

from app.core.config import settings
from app.schemas.resume import ResumeStructured
from app.utils.prompt_helper import build_resume_structure_prompt

_client = OpenAI(api_key=settings.OPENAI_API_KEY)


def parse_resume(text: str) -> ResumeStructured:
    """
    Send resume text to OpenAI and extract structured data as a ResumeStructured object.
    Uses responses.parse() which handles json_schema + additionalProperties automatically.
    """
    prompt = build_resume_structure_prompt(text)

    response = _client.responses.parse(
        model="gpt-5.4-mini",
        input=prompt,
        temperature=0,
        text_format=ResumeStructured,
    )

    parsed = response.output_parsed
    if isinstance(parsed, ResumeStructured):
        return parsed

    return ResumeStructured()


def get_embedding(text: str) -> List[float]:
    """
        Generate embedding vector for a single text.
        """
    if not text.strip():
        return []

    response = _client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )

    return response.data[0].embedding


def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts.
    """
    if not texts:
        return []

    response = _client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )

    return [item.embedding for item in response.data]
