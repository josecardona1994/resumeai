"""ResumeAI — FastAPI backend."""

import os
from pathlib import Path

import httpx
import yaml
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

load_dotenv()

from models import Profile, User, get_db, init_db
from generator import generate_pdf_bytes, generate_docx_bytes

app = FastAPI(title="ResumeAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# ── Auth helper ───────────────────────────────────────────────────────────────

CLERK_DOMAIN = "smart-muskox-864.clerk.accounts.dev"
_jwks_cache: dict = {}

async def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://{CLERK_DOMAIN}/.well-known/jwks.json")
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache

async def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ", 1)[1]

    try:
        import jwt as pyjwt
        from jwt.algorithms import RSAAlgorithm

        jwks = await _get_jwks()
        header = pyjwt.get_unverified_header(token)
        kid = header.get("kid")

        key_data = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if not key_data:
            raise HTTPException(status_code=401, detail="Invalid token key")

        public_key = RSAAlgorithm.from_jwk(key_data)
        payload = pyjwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )

        clerk_user_id = payload.get("sub")
        if not clerk_user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token verification failed")

    user = db.query(User).filter(User.id == clerk_user_id).first()
    if not user:
        # Fetch name/email from Clerk API on first login
        clerk_secret = os.getenv("CLERK_SECRET_KEY", "")
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.clerk.com/v1/users/{clerk_user_id}",
                    headers={"Authorization": f"Bearer {clerk_secret}"},
                )
            u = resp.json()
            email = u.get("email_addresses", [{}])[0].get("email_address", "")
            name = f"{u.get('first_name','')} {u.get('last_name','')}".strip()
        except Exception:
            email, name = "", ""

        user = User(id=clerk_user_id, email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


# ── Default empty profile ─────────────────────────────────────────────────────

def _empty_profile(name: str = "", email: str = "") -> dict:
    return {
        "personal": {
            "name": name,
            "title": "",
            "email": email,
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": "",
        },
        "profile_summary": "",
        "education": [],
        "experience": [],
        "skills": [],
        "languages": [],
        "certificates": [],
        "non_cert_skills": [],
        "projects": [],
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "ResumeAI API"}


@app.get("/api/profile")
def get_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        return _empty_profile(user.name, user.email)
    return profile.data


@app.put("/api/profile")
def save_profile(
    body: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile:
        profile.data = body
    else:
        profile = Profile(user_id=user.id, data=body)
        db.add(profile)
    db.commit()
    return {"status": "saved"}


@app.post("/api/generate/pdf")
def generate_pdf(
    body: dict = {},
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile or not profile.data:
        raise HTTPException(status_code=400, detail="No profile found. Please fill your profile first.")

    template = body.get("template", "classic") if body else "classic"
    pdf_bytes = generate_pdf_bytes(profile.data, template)
    name = profile.data.get("personal", {}).get("name", "resume").replace(" ", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{name}_{template}_resume.pdf"'},
    )


@app.post("/api/generate/docx")
def generate_docx(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile or not profile.data:
        raise HTTPException(status_code=400, detail="No profile found.")

    docx_bytes = generate_docx_bytes(profile.data)
    name = profile.data.get("personal", {}).get("name", "resume").replace(" ", "_")
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{name}_resume.docx"'},
    )


@app.post("/api/linkedin/import")
async def import_linkedin(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import tempfile
    from pathlib import Path
    import sys
    sys.path.insert(0, str(Path(__file__).parent))

    content = await file.read()
    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    profile_row = db.query(Profile).filter(Profile.user_id == user.id).first()
    current = profile_row.data if profile_row else _empty_profile(user.name, user.email)

    from linkedin import import_linkedin_zip
    updated = import_linkedin_zip(tmp_path, current)

    if profile_row:
        profile_row.data = updated
    else:
        db.add(Profile(user_id=user.id, data=updated))
    db.commit()

    Path(tmp_path).unlink(missing_ok=True)
    return {"status": "imported", "profile": updated}


@app.post("/api/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from resume_parser import parse_resume

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    try:
        parsed = parse_resume(content, file.filename or "resume.pdf")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse resume. Try a different file.")

    profile_row = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile_row:
        profile_row.data = parsed
    else:
        db.add(Profile(user_id=user.id, data=parsed))
    db.commit()

    return {"status": "parsed", "profile": parsed}


@app.post("/api/ai/update")
async def ai_update(
    body: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import yaml as yaml_lib
    from anthropic import Anthropic

    user_message = body.get("message", "")
    if not user_message:
        raise HTTPException(status_code=400, detail="message is required")

    profile_row = db.query(Profile).filter(Profile.user_id == user.id).first()
    current = profile_row.data if profile_row else _empty_profile(user.name, user.email)
    profile_yaml = yaml_lib.dump(current, allow_unicode=True, sort_keys=False)

    client = Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system="""You are a professional resume writer assistant.
Update the user's profile based on what they describe.
Rules:
- Use strong action verbs (Developed, Built, Designed, Led, Implemented...)
- Quantify achievements where possible
- Keep bullet points concise, one line each
- For new projects: write a clear 2-3 sentence professional description
- For skills: add appropriate simple-icons slug and hex color (no #)
- Return ONLY valid YAML — no markdown fences, no explanation
- Preserve all existing data; only add or modify what was asked""",
        messages=[{
            "role": "user",
            "content": f"Current profile:\n{profile_yaml}\n\nUpdate: {user_message}\n\nReturn the complete updated profile YAML."
        }]
    )

    updated_yaml = response.content[0].text.strip()
    new_profile = yaml_lib.safe_load(updated_yaml)

    if profile_row:
        profile_row.data = new_profile
    else:
        db.add(Profile(user_id=user.id, data=new_profile))
    db.commit()

    return {"status": "updated", "profile": new_profile}
