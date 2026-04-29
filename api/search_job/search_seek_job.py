import uuid
import sys
import re
from time import sleep
from datetime import datetime
from pathlib import Path

from pydantic import BaseModel

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from curl_cffi import requests
from sqlalchemy.orm import Session
from app.schemas.job import JobCreate
from app.services.job_service import upsert_job_by_origin_id
from app.db.init_db import get_session_factory
from app.core.config import settings
from app.models.job import Job
from app.utils.process_job import process_job

# Constants sourced from settings (app/core/config.py → .env)
SEEK_GRAPHQL_URL = settings.SEEK_GRAPHQL_URL
SEEK_IMPERSONATE = settings.SEEK_IMPERSONATE
SESSION_ID = settings.SEEK_SESSION_ID
ZONE = settings.SEEK_ZONE
SOL_ID = settings.SEEK_SOL_ID
VISITOR_ID = settings.SEEK_VISITOR_ID


class SeekPayload(BaseModel):
    keywords: str
    where: str


def _common_headers(referer: str = "https://www.seek.com.au") -> dict:
    """Generate common headers for SEEK API requests"""
    return {
        "accept": "*/*",
        "accept-language": "en-AU,en;q=0.9",
        "content-type": "application/json",
        "origin": "https://www.seek.com.au",
        "referer": referer,
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
        "x-seek-site": "chalice",
        "seek-request-country": "AU",
        "seek-request-brand": "seek",
        "x-custom-features": "application/features.seek.all+json",
        "x-seek-ec-sessionid": SESSION_ID,
        "x-seek-ec-visitorid": SESSION_ID,
        "cookie": "_dd_s=; _fbp=fb.2.1777358917238.169482446508620592; sol_id=" + SOL_ID
    }


def _post_graphql(operation_name: str, query: str, variables: dict, referer: str) -> dict | None:
    """Execute a GraphQL request to SEEK API"""
    headers = _common_headers(referer)
    payload = {
        "operationName": operation_name,
        "variables": variables,
        "query": query
    }

    try:
        # Add small fixed delay to mimic human-like request pacing.
        sleep(0.5)
        response = requests.post(
            SEEK_GRAPHQL_URL,
            headers=headers,
            json=payload,
            impersonate=SEEK_IMPERSONATE
        )

        if response.status_code == 200:
            data = response.json()
            if "errors" in data:
                print(f"API Error: {data['errors'][0].get('message', 'Unknown error')}")
                print(data['errors'][0])
                return None
            return data
        else:
            print(f"Request failed，status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Request exception: {e}")
        return None


def _parse_datetime(dt_str: str) -> datetime | None:
    """Parse ISO datetime string to datetime object"""
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except Exception:
        return None


def _to_job_create_payload(job_data: dict) -> JobCreate:
    """Convert SEEK job detail response to JobCreate schema"""
    return JobCreate(
        origin_id=int(job_data.get("id", 0)),
        title=job_data.get("title", ""),
        raw_content=job_data.get("content", ""),
        raw_text="",
        salary=job_data.get("salary", {}).get("label") if job_data.get("salary") else None,
        share_link=job_data.get("shareLink"),
        location=job_data.get("location", {}).get("label") if job_data.get("location") else None,
        advertiser=job_data.get("advertiser", {}).get("name") if job_data.get("advertiser") else None,
        expires_at=_parse_datetime(
            job_data.get("expiresAt", {}).get("dateTimeUtc")
            if job_data.get("expiresAt") else None
        ),
        is_expired=job_data.get("isExpired", False),
        listed_at=_parse_datetime(
            job_data.get("listedAt", {}).get("dateTimeUtc")
            if job_data.get("listedAt") else None
        )
    )


def fetch_job_details(job_id: int) -> dict | None:
    """Fetch detailed information for a specific job"""
    query = """
        query jobDetails($jobId: ID!, $jobDetailsViewedCorrelationId: String!, $sessionId: String!, $zone: Zone!, $locale: Locale!, $timezone: Timezone!) {
          jobDetails(id: $jobId, tracking: {channel: "WEB", jobDetailsViewedCorrelationId: $jobDetailsViewedCorrelationId, sessionId: $sessionId}) {
            ...job
            __typename
          }
        }

        fragment job on JobDetails {
          job {
            id
            title
            content(platform: WEB)
            expiresAt {
                dateTimeUtc
                __typename
                }
            isExpired
            listedAt {
                label(context: JOB_POSTED, length: SHORT, timezone: $timezone, locale: $locale)
                dateTimeUtc
                __typename
                }
            salary {
                label
                }
            shareLink(platform: WEB, zone: $zone, locale: $locale)
            location { label(locale: $locale, type: LONG) }
            advertiser { name(locale: $locale) }
          }
          __typename
        }
    """

    variables = {
        "jobId": str(job_id),
        "jobDetailsViewedCorrelationId": str(uuid.uuid4()),
        "sessionId": SESSION_ID,
        "zone": ZONE,
        "locale": "en-AU",
        "languageCode": "en",
        "countryCode": "AU",
        "timezone": "Australia/Sydney",
        "visitorId": VISITOR_ID,
        "isAuthenticated": False,
        "enableJdvBadge": True,
        "enableClickToReveal": False
    }

    referer = f"https://www.seek.com.au/job/{job_id}"
    response = _post_graphql("jobDetails", query, variables, referer)

    if response:
        return response.get("data", {}).get("jobDetails", {}).get("job")
    return None


def _slugify_seek(value: str) -> str:
    """Convert free-text into SEEK URL path slug."""
    slug = re.sub(r"[^A-Za-z0-9]+", "-", value).strip("-")
    return slug or "jobs"


def _build_seek_search_referer(payload: SeekPayload) -> str:
    """Build SEEK referer URL from query payload."""
    keywords_slug = _slugify_seek(payload.keywords)
    where_slug = _slugify_seek(payload.where)
    return f"https://www.seek.com.au/{keywords_slug}-jobs/in-{where_slug}?sortmode=ListedDate"


def fetch_seek_jobs(payload: SeekPayload) -> list[dict]:
    """Fetch list of jobs from SEEK with pagination until all jobs collected or jobs are older than 7 days"""
    query = """
    query JobSearchV6($params: JobSearchV6QueryInput!, $locale: Locale!, $timezone: Timezone!) {
      jobSearchV6(params: $params) {
        data {
          id
          title
          companyName
          salaryLabel
          listingDate {
            dateTimeUtc
            label(context: JOB_POSTED, length: SHORT, timezone: $timezone, locale: $locale)
          }
        }
        totalCount
      }
    }
    """

    all_jobs = []
    page = 1
    total_count = 0
    cutoff_days = 7
    referer = _build_seek_search_referer(payload)
    # Keep one userQueryId for the full pagination run.
    run_user_query_id = str(uuid.uuid4())

    while True:
        variables = {
            "params": {
                "channel": "web",
                "eventCaptureSessionId": SESSION_ID,
                "eventCaptureUserId": SESSION_ID,
                "include": ["seoData", "gptTargeting", "relatedSearches"],
                "keywords": payload.keywords,
                "locale": "en-AU",
                "page": page,
                "pageSize": 32,
                "queryHints": ["spellingCorrection"],
                "siteKey": "AU",
                "solId": SOL_ID,
                "sortMode": "ListedDate",
                "source": "FE_SERP",
                "userQueryId": run_user_query_id,
                "userSessionId": SESSION_ID,
                "where": payload.where,
                "relatedSearchesCount": 12
            },
            "locale": "en-AU",
            "timezone": "Australia/Sydney"
        }

        print(f"Fetching page {page}...")

        response = _post_graphql("JobSearchV6", query, variables, referer)

        if not response:
            print(f"Failed to fetch page {page}. Stopping pagination.")
            break

        jobs = response.get("data", {}).get("jobSearchV6", {}).get("data", [])
        total_count = response.get("data", {}).get("jobSearchV6", {}).get("totalCount", 0)

        if not jobs:
            print("No more jobs in this page. Stopping pagination.")
            break

        all_jobs.extend(jobs)
        print(f"  Page {page}: got {len(jobs)} jobs (total so far: {len(all_jobs)}/{total_count})")

        # Check if we got all jobs
        if len(all_jobs) >= total_count:
            print(f"All jobs retrieved: {len(all_jobs)}/{total_count}")
            break

        # Check if last job is older than cutoff_days
        last_job = jobs[-1]
        last_job_date_str = last_job.get("listingDate", {}).get("dateTimeUtc")
        last_job_date = _parse_datetime(last_job_date_str) if last_job_date_str else None

        if last_job_date:
            days_old = (datetime.now(last_job_date.tzinfo or __import__('datetime').timezone.utc) - last_job_date).days
            print(f"  Last job on this page is {days_old} days old")

            if days_old >= cutoff_days:
                print(f"Last job is older than {cutoff_days} days. Stopping pagination.")
                break
        else:
            print(f"  Could not parse listing date from last job. Continuing pagination.")

        page += 1

    print(f"\nSuccess found {total_count} positions! Collected {len(all_jobs)} jobs.\n")
    return all_jobs


def _extract_job_id(value: object) -> int | None:
    """Safely parse SEEK job id into int."""
    try:
        return int(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _get_existing_origin_ids(db: Session, job_ids: list[int]) -> set[int]:
    """Load existing job origin_ids in one query for fast dedupe."""
    if not job_ids:
        return set()
    rows = db.query(Job.origin_id).filter(Job.origin_id.in_(job_ids)).all()
    return {row[0] for row in rows}


def save_seek_jobs_to_db(payload: SeekPayload) -> int:
    """Fetch all jobs from SEEK and save to database"""
    jobs = fetch_seek_jobs(payload)

    if not jobs:
        print("No jobs found to save")
        return 0

    db: Session = get_session_factory()()
    saved_count = 0

    try:
        incoming_job_ids = [
            parsed_id
            for parsed_id in (_extract_job_id(job.get("id")) for job in jobs)
            if parsed_id is not None
        ]
        existing_origin_ids = _get_existing_origin_ids(db, incoming_job_ids)

        for job_summary in jobs:
            job_id = _extract_job_id(job_summary.get("id"))
            if job_id is None:
                print(f"Skip invalid job id: {job_summary.get('id')}")
                continue

            if job_id in existing_origin_ids:
                print(f"Skip existing job {job_id}")
                continue

            print(f"Fetching details for new job {job_id}...")
            job_detail = fetch_job_details(job_id)
            if not job_detail:
                print(f"Failed to fetch details for job {job_id}")
                continue

            # Convert to JobCreate payload (use different variable name to avoid shadowing `payload`)
            job_create = _to_job_create_payload(job_detail)

            # Upsert to database (create if new, update if exists)
            try:
                processed_job = process_job(job_create)
                # Process job to fill raw_text, structured_data, embedding_vector
                upsert_job_by_origin_id(db, processed_job)
                existing_origin_ids.add(job_id)
                saved_count += 1
                print(f"Saved new job: {job_detail.get('title', 'Unknown')}")
            except Exception as e:
                print(f"Error saving job {job_id}: {e}")
                continue

        print(f"\nTotal new jobs saved: {saved_count}")
        return saved_count

    finally:
        db.close()


if __name__ == "__main__":
    save_seek_jobs_to_db(payload=SeekPayload(keywords="software engineer", where="South Australia SA"))
