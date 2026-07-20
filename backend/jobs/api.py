from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "module": "jobs"}


@router.post("/auth/login")
def auth_login(payload: dict[str, str]) -> dict[str, str]:
    email = payload.get("email", "")
    if not email:
        raise HTTPException(status_code=400, detail="email is required")
    return {"message": "login accepted", "email": email}


@router.post("/auth/signup")
def auth_signup(payload: dict[str, str]) -> dict[str, str]:
    email = payload.get("email", "")
    if not email:
        raise HTTPException(status_code=400, detail="email is required")
    return {"message": "signup accepted", "email": email}


@router.get("/profile")
def get_profile() -> dict[str, str]:
    return {"message": "profile ready"}


@router.post("/profile")
def update_profile(payload: dict[str, object]) -> dict[str, object]:
    return {"message": "profile updated", "payload": payload}


@router.post("/resume/analyze")
def analyze_resume(payload: dict[str, str]) -> dict[str, object]:
    content = payload.get("content", "")
    return {
        "message": "resume analysis ready",
        "ats_score": 80,
        "summary": content[:200],
        "suggestions": ["Add measurable impact", "Tailor keywords to the target role"],
    }


@router.get("/jobs/search")
def search_jobs() -> list[dict[str, object]]:
    return [{"title": "Senior Product Engineer", "location": "Remote", "match_score": 91}]


@router.get("/recommendations")
def recommendations() -> list[dict[str, object]]:
    return [{"job_title": "Frontend Engineer", "score": 88, "reason": "Strong React experience"}]


@router.post("/applications")
def submit_application(payload: dict[str, object]) -> dict[str, object]:
    return {"message": "application prepared", "payload": payload}


@router.get("/notifications")
def notifications() -> list[dict[str, object]]:
    return [{"title": "Interview invitation", "body": "Your interview has been scheduled"}]


@router.get("/interviews")
def interviews() -> list[dict[str, object]]:
    return [{"status": "scheduled", "scheduled_for": "2026-07-28T10:00:00Z"}]


@router.get("/companies")
def companies() -> list[dict[str, object]]:
    return [{"name": "Northstar Labs", "verified": True}]


@router.get("/admin/analytics")
def admin_analytics() -> dict[str, object]:
    return {"active_jobs": 14, "verified_employers": 6, "applications": 38}
