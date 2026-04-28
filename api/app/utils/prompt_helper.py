from app.schemas.resume import ResumeStructured


def build_resume_structure_prompt(row_text: str) -> str:
    return f"""
    Summary and extract structured information from the resume below.
    Return ONLY a valid JSON matching the required schema with these fields:
    - name, email, summary
    - skills (list of strings)
    - experience_years (integer or null)
    - education (list with school, degree, year)
    - projects (list with name, description)
    
    Resume:
    {row_text}
    """


def build_resume_embedding_prompt(structured_data: ResumeStructured) -> str:
    return f"""
    Summary: {structured_data.summary}

    Skills: {", ".join(structured_data.skills)}

    Work:
    {" ".join([w.description for w in structured_data.works])}

    Projects:
    {" ".join([p.description for p in structured_data.projects])}
    """
