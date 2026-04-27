from app.services.ai_services import parse_resume
from app.utils.file_parser import extract_text


def process_resume(file, filename: str):
    text = extract_text(file, filename)
    
    try:
        structured = parse_resume(text)
        structured_dict = structured.model_dump()
    except Exception as e:
        print(f"Warning: Could not parse resume with AI: {e}")
        structured_dict = {}

    return {
        "raw_text": text,
        "structured_data": structured_dict
    }
