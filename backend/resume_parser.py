"""Parse an uploaded PDF or DOCX resume into our profile schema using Claude AI."""

import json
import io
from pathlib import Path


def _extract_text_pdf(file_bytes: bytes) -> str:
    import pdfplumber
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    return "\n".join(text_parts)


def _extract_text_docx(file_bytes: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


PROFILE_SCHEMA = """
{
  "personal": {
    "name": "Full name",
    "title": "Job title / role",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, Country",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username"
  },
  "profile_summary": "2-3 sentence professional summary",
  "experience": [
    {
      "company": "COMPANY NAME",
      "title": "Job Title",
      "period": "2020 - 2023",
      "bullets": ["Achievement or responsibility...", "..."]
    }
  ],
  "education": [
    {
      "institution": "UNIVERSITY NAME",
      "degree": "Degree name",
      "period": "2015 - 2019"
    }
  ],
  "skills": [
    {"name": "Python", "icon": "python", "color": "3776AB"}
  ],
  "languages": [
    {"name": "English", "level": "Fluent"}
  ],
  "certificates": ["Certificate name"],
  "non_cert_skills": [],
  "projects": [
    {
      "name": "Project name",
      "description": "What it does and the impact.",
      "github": "github.com/username/repo"
    }
  ]
}
"""

SKILL_ICONS = """
Common simple-icons slugs and colors:
python=3776AB, javascript=F7DF1E, typescript=3178C6, react=61DAFB,
nodejs=5FA04E, nextdotjs=000000, postgresql=4169E1, mysql=4479A1,
mongodb=47A248, docker=2496ED, git=F05032, github=181717,
microsoftazure=0078D4, amazonaws=232F3E, googlecloud=4285F4,
tensorflow=FF6F00, pytorch=EE4C2C, powerbi=F2C811, tableau=E97627,
microsoftexcel=217346, linux=FCC624, kalilinux=557C94, notion=000000,
figma=F24E1E, anthropic=D4A574, openai=412991, fastapi=009688,
databricks=FF3621, spark=E25A1C, java=007396, go=00ADD8,
rust=000000, csharp=239120, dotnet=512BD4, flutter=02569B
"""


def parse_resume(file_bytes: bytes, filename: str) -> dict:
    """Extract text from PDF or DOCX, parse into profile schema with Claude."""
    ext = Path(filename).suffix.lower()

    if ext == ".pdf":
        raw_text = _extract_text_pdf(file_bytes)
    elif ext in (".docx", ".doc"):
        raw_text = _extract_text_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Upload a PDF or DOCX.")

    if not raw_text.strip():
        raise ValueError("Could not extract text from the file. Make sure it's not a scanned image.")

    import os
    import requests as req_lib

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 4096,
        "system": f"""You are a resume parser. Extract structured data from the resume text below.
Return ONLY a valid JSON object matching the schema — no markdown, no explanation, no code fences.

Rules:
- Use ALL CAPS for company and institution names
- Write bullets using strong action verbs (Built, Led, Developed, Designed...)
- If a field is not found, use an empty string or empty array
- For skills, pick the best matching simple-icons slug and color from this reference:
{SKILL_ICONS}
- If a skill has no icon match, use empty strings for icon and color
- github and linkedin fields: include only the path, not https:// prefix

Schema to follow:
{PROFILE_SCHEMA}""",
        "messages": [{"role": "user", "content": f"Parse this resume into the JSON schema:\n\n{raw_text}"}],
    }
    resp = req_lib.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json=payload,
        timeout=90,
    )
    resp.raise_for_status()
    raw_json = resp.json()["content"][0]["text"].strip()

    # Strip markdown fences if model adds them despite instructions
    if raw_json.startswith("```"):
        raw_json = raw_json.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    return json.loads(raw_json)
