from openai import OpenAI

from app.core.config import settings
from app.schemas.resume import ResumeStructured

_client = OpenAI(api_key=settings.OPENAI_API_KEY)


def parse_resume(text: str) -> ResumeStructured:
    """
    Send resume text to OpenAI and extract structured data as a ResumeStructured object.
    Uses responses.parse() which handles json_schema + additionalProperties automatically.
    """
    prompt = f"""
    Extract structured information from the resume below.
    Return ONLY a valid JSON matching the required schema with these fields:
    - name, email, summary
    - skills (list of strings)
    - experience_years (integer or null)
    - education (list with school, degree, year)
    - projects (list with name, description)
    
    Resume:
    {text}
    """

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
