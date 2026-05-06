from typing import List

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.job import Job
from app.models.resume import Resume
from app.schemas.job import JobMatchOut


def match_jobs(
        db: Session,
        resume: Resume,
        skip: int = 0,
        limit: int = 10,
) -> List[JobMatchOut]:
    """
    Return ranked jobs by cosine similarity.
    """
    if resume.embedding_vector is None or len(resume.embedding_vector) == 0:
        return []

    score_expr = (1 - Job.embedding_vector.cosine_distance(resume.embedding_vector)).label("score")
    result = (
        db.query(Job, score_expr)
        .filter(Job.embedding_vector.isnot(None))
        .order_by(desc(score_expr))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        JobMatchOut(
            id=job.id,
            title=job.title,
            raw_content=job.raw_content,
            share_link=job.share_link,
            listed_at=job.listed_at,
            expires_at=job.expires_at,
            location=job.location,
            score=float(score),
        )
        for job, score in result
    ]
