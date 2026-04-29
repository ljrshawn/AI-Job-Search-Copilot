def build_summary_prompt(type: str, focus: str, row_text: str) -> str:
    return (
        f"Summarize the {type} in 2-3 sentences, focusing on {focus}.\n"
        f"{row_text}"
    )


def build_resume_structure_prompt(row_text: str) -> str:
    return (
        "Extract structured resume information. Return ONLY valid JSON.\n"
        "Schema:\n"
        "{summary: string, skills: string[], requirements: string[], "
        "experience_years: number|null, seniority: string, domain: string}\n\n"
        "Rules:\n"
        "- skills = technical skills/tools\n"
        "- requirements = responsibilities the person has done (experience-based)\n"
        "- seniority: infer from experience_years\n"
        "- domain: primary tech area (backend/frontend/data/devops/etc)\n"
        "- no hallucination\n"
        "- missing = null or []\n"
        "- no extra text\n\n"
        f"Resume:\n{row_text}"
    )


def build_job_structure_prompt(row_text: str) -> str:
    return (
        "Extract structured job information. Return ONLY valid JSON.\n"
        "Schema:\n"
        "{summary: string, skills: string[], requirements: string[], "
        "experience_years: number|null, seniority: string, domain: string}\n\n"
        "Rules:\n"
        "- skills = required technical skills/tools\n"
        "- requirements = responsibilities / must-haves\n"
        "- experience_years = required experience if stated, else null\n"
        "- seniority = infer from requirements\n"
        "- domain = job category\n"
        "- missing = null or []\n"
        "- no extra text\n\n"
        f"Job:\n{row_text}"
    )


def build_embedding_prompt(data) -> str:
    return (
        f"domain: {data.domain}\n"
        f"seniority: {data.seniority}\n"
        f"experience_years: {data.experience_years or 0}\n"
        f"skills: {', '.join(data.skills)}\n"
        f"requirements: {', '.join(data.requirements)}\n"
        f"summary: {data.summary}"
    )
