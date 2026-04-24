from app.utils.file_parser import extract_text


def process_resume(file):
    """

    :param file:
    :return:
    """
    text = extract_text(file)

    return {
        "raw_text": text,
        "structured_data": {
            "name": "John Doe",
            "email": ""}
    }
