from app.schemas.job import JobCreate
from app.services.ai_services import get_embedding, parse_job
from app.utils.prompt_helper import build_embedding_prompt
from app.utils.raw_job_data_clean import raw_job_data_clean


def process_job(job: JobCreate) -> JobCreate:
    """Process job: parse structure and embedding."""
    text = raw_job_data_clean(job.raw_content)

    structured_dict = {}
    embedding_vector = None

    try:
        structured = parse_job(text)
        structured_dict = structured.model_dump()

        # Pass the structured object (not dict) to embedding function
        embedding_vector = get_embedding(build_embedding_prompt(structured))
    except Exception as e:
        print(f"Warning: Could not parse job with AI: {e}")

    payload = job.model_dump()
    payload["raw_text"] = text
    payload["structured_data"] = structured_dict
    payload["embedding_vector"] = embedding_vector
    return JobCreate(**payload)
