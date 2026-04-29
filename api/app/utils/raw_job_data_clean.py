from bs4 import BeautifulSoup


def clean_html(text: str) -> str:
    soup = BeautifulSoup(text, "html.parser")
    return "\n".join(soup.stripped_strings)


def trim_text(text: str) -> str:
    keep_keywords = [
        "you will provide",
        "about you",
        "responsibilities",
        "qualifications",
        "experience",
        "key responsibilities",
        "key experience",
    ]

    stop_keywords = [
        "what we offer",
        "who we are",
        "benefits",
        "please note",
        "about us",
        "copyright",
    ]

    lines = text.split("\n")

    filtered = []
    in_keep_section = False

    for line in lines:
        current = line.strip()
        if not current:
            continue

        lowered = current.lower()

        # start keep section
        if any(k in lowered for k in keep_keywords):
            in_keep_section = True
            continue

        # stop section (but only if it's a real header)
        if any(k in lowered for k in stop_keywords) and len(current) < 80:
            in_keep_section = False
            continue

        # always keep bullet points
        if current.startswith("-"):
            if in_keep_section:
                filtered.append(current)
            continue

        # normal text
        if in_keep_section:
            filtered.append(current)

    return "\n".join(filtered)


def raw_job_data_clean(raw_job_data: str) -> str:
    cleaned_html = clean_html(raw_job_data)
    return trim_text(cleaned_html)


