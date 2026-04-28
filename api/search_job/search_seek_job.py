import uuid
import sys
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from curl_cffi import requests
from sqlalchemy.orm import Session
from app.schemas.job import JobCreate
from app.services.job_service import upsert_job_by_origin_id
from app.db.init_db import get_session_factory

# Constants
SEEK_GRAPHQL_URL = "https://www.seek.com.au/graphql"
SEEK_IMPERSONATE = "chrome120"
SESSION_ID = "c158e5a6-3e01-4754-a631-07c2987cbe15"
ZONE = "anz-1"
SOL_ID = "6ad1862b-66fa-4cde-836e-01a5b69b0234"
VISITOR_ID = "6ad1862b-66fa-4cde-836e-01a5b69b0234"


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


def fetch_seek_jobs() -> list[dict]:
    """Fetch list of jobs from SEEK"""
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

    variables = {
        "params": {
            "channel": "web",
            "eventCaptureSessionId": SESSION_ID,
            "eventCaptureUserId": SESSION_ID,
            "include": ["seoData", "gptTargeting", "relatedSearches"],
            "keywords": "software engineer",
            "locale": "en-AU",
            "page": 1,
            "pageSize": 32,
            "queryHints": ["spellingCorrection"],
            "siteKey": "AU",
            "solId": SOL_ID,
            "sortMode": "ListedDate",
            "source": "FE_SERP",
            "userQueryId": "38a9603ecd5af21ed989dc609e8ba580-8917330",
            "userSessionId": SESSION_ID,
            "where": "South Australia SA",
            "relatedSearchesCount": 12
        },
        "locale": "en-AU",
        "timezone": "Australia/Sydney"
    }

    referer = "https://www.seek.com.au/software-engineer-jobs/in-South-Australia-SA?sortmode=ListedDate"
    print("Request Seek data...")

    response = _post_graphql("JobSearchV6", query, variables, referer)

    if response:
        jobs = response.get("data", {}).get("jobSearchV6", {}).get("data", [])
        total = response.get("data", {}).get("jobSearchV6", {}).get("totalCount", 0)
        print(f"Success found {total} position！\n")
        return jobs
    return []


def save_seek_jobs_to_db() -> int:
    """Fetch all jobs from SEEK and save to database"""
    jobs = fetch_seek_jobs()

    if not jobs:
        print("No jobs found to save")
        return 0

    db: Session = get_session_factory()()
    saved_count = 0

    try:
        for job_summary in jobs:
            job_id = job_summary.get("id")
            print(f"Fetching details for job {job_id}...")

            job_detail = fetch_job_details(int(job_id))
            if not job_detail:
                print(f"Failed to fetch details for job {job_id}")
                continue

            # Convert to JobCreate payload
            payload = _to_job_create_payload(job_detail)

            # Upsert to database (create if new, update if exists)
            try:
                upsert_job_by_origin_id(db, payload)
                saved_count += 1
                print(f"✓ Saved: {job_detail.get('title', 'Unknown')}")
            except Exception as e:
                print(f"✗ Error saving job {job_id}: {e}")
                continue

        print(f"\nTotal jobs saved: {saved_count}/{len(jobs)}")
        return saved_count

    finally:
        db.close()


if __name__ == "__main__":
    save_seek_jobs_to_db()

