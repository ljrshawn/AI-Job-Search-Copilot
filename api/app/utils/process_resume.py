from app.services.ai_services import parse_resume, get_embedding
from app.utils.file_parser import extract_text
from app.utils.prompt_helper import build_embedding_prompt


def process_resume(file, filename: str):
    """Process resume file: extract text, parse structure."""
    text = extract_text(file, filename)

    structured_dict = {}
    embedding_vector = None

    try:
        structured = parse_resume(text)
        structured_dict = structured.model_dump()

        # Pass the structured object (not dict) to embedding function
        embedding_vector = get_embedding(build_embedding_prompt(structured))
    except Exception as e:
        print(f"Warning: Could not parse resume with AI: {e}")

    return {
        "raw_text": text,
        "structured_data": structured_dict,
        "embedding_vector": embedding_vector,
        "file_name": filename,
    }
