"""LinkedIn data export importer.

How to get your LinkedIn export:
  1. LinkedIn → Settings → Data Privacy → Get a copy of your data
  2. Select: Profile, Positions, Education, Skills, Certifications
  3. Download the ZIP (arrives in ~10 minutes)
  4. Run: python resume.py sync-linkedin path/to/LinkedIn_Data_Export.zip
"""

import csv
import io
import zipfile
from pathlib import Path
from rich.console import Console

console = Console()

ICON_MAP = {
    "python": ("python", "3776AB"),
    "sql": ("postgresql", "4169E1"),
    "power bi": ("powerbi", "F2C811"),
    "excel": ("microsoftexcel", "217346"),
    "tableau": ("tableau", "E97627"),
    "javascript": ("javascript", "F7DF1E"),
    "typescript": ("typescript", "3178C6"),
    "react": ("react", "61DAFB"),
    "node": ("nodedotjs", "339933"),
    "docker": ("docker", "2496ED"),
    "aws": ("amazonaws", "232F3E"),
    "azure": ("microsoftazure", "0078D4"),
    "git": ("git", "F05032"),
    "github": ("github", "181717"),
    "blockchain": ("bitcoin", "F7931A"),
    "ethereum": ("ethereum", "3C3C3D"),
    "solidity": ("solidity", "363636"),
    "postgresql": ("postgresql", "4169E1"),
    "mysql": ("mysql", "4479A1"),
    "mongodb": ("mongodb", "47A248"),
    "fastapi": ("fastapi", "009688"),
    "django": ("django", "092E20"),
    "flask": ("flask", "000000"),
    "airflow": ("apacheairflow", "017CEE"),
    "spark": ("apachespark", "E25A1C"),
    "databricks": ("databricks", "FF3621"),
    "jira": ("jira", "0052CC"),
    "notion": ("notion", "000000"),
}


def _read_csv_from_zip(zf: zipfile.ZipFile, filename: str) -> list[dict]:
    """Read a CSV file from a ZIP, returning list of dicts."""
    for name in zf.namelist():
        if Path(name).name.lower() == filename.lower():
            with zf.open(name) as f:
                content = f.read().decode("utf-8-sig")
                return list(csv.DictReader(io.StringIO(content)))
    return []


def _skill_to_entry(skill_name: str) -> dict:
    key = skill_name.lower()
    for keyword, (icon, color) in ICON_MAP.items():
        if keyword in key:
            return {"name": skill_name, "icon": icon, "color": color}
    return {"name": skill_name, "icon": "checkmarx", "color": "444444"}


def import_linkedin_zip(zip_path: str, profile: dict) -> dict:
    path = Path(zip_path)
    if not path.exists():
        console.print(f"[red]File not found: {zip_path}[/]")
        return profile

    with zipfile.ZipFile(path) as zf:
        console.print(f"[dim]Files in ZIP: {', '.join(zf.namelist())}[/]")

        # ── Positions (work experience) ──────────────────────────────
        positions = _read_csv_from_zip(zf, "Positions.csv")
        if positions:
            console.print(f"[cyan]Found {len(positions)} positions[/]")
            existing_titles = {
                (e.get("title", "").lower(), e.get("company", "").lower())
                for e in profile.get("experience", [])
            }
            for pos in positions:
                company = pos.get("Company Name", "").strip()
                title = pos.get("Title", "").strip()
                start = pos.get("Started On", "").strip()
                end = pos.get("Finished On", "").strip() or "PRESENT"
                description = pos.get("Description", "").strip()

                key = (title.lower(), company.lower())
                if key in existing_titles:
                    continue

                bullets = []
                if description:
                    for line in description.split("\n"):
                        line = line.strip().lstrip("•-– ").strip()
                        if line:
                            bullets.append(line)

                entry = {
                    "period": f"{start} – {end}",
                    "company": company.upper(),
                    "title": title,
                    "bullets": bullets if bullets else ["[Add description]"],
                }
                profile.setdefault("experience", []).append(entry)
                console.print(f"[green]+[/] Added position: {title} @ {company}")

        # ── Education ────────────────────────────────────────────────
        education = _read_csv_from_zip(zf, "Education.csv")
        if education:
            console.print(f"[cyan]Found {len(education)} education entries[/]")
            existing_insts = {
                e.get("institution", "").lower()
                for e in profile.get("education", [])
            }
            for edu in education:
                school = edu.get("School Name", "").strip()
                degree = edu.get("Degree Name", "").strip()
                field = edu.get("Field Of Study", "").strip()
                start = edu.get("Start Date", "").strip()
                end = edu.get("End Date", "").strip() or "ONGOING"

                if school.lower() in existing_insts:
                    continue

                profile.setdefault("education", []).append({
                    "period": f"{start} – {end}",
                    "institution": school.upper(),
                    "degree": f"{degree} {f'in {field}' if field else ''}".strip(),
                })
                console.print(f"[green]+[/] Added education: {school}")

        # ── Skills ───────────────────────────────────────────────────
        skills = _read_csv_from_zip(zf, "Skills.csv")
        if skills:
            console.print(f"[cyan]Found {len(skills)} skills[/]")
            existing_skills = {
                s.get("name", "").lower()
                for s in profile.get("skills", [])
            }
            for skill in skills:
                name = skill.get("Name", "").strip()
                if not name or name.lower() in existing_skills:
                    continue
                entry = _skill_to_entry(name)
                profile.setdefault("skills", []).append(entry)
                console.print(f"[green]+[/] Added skill: {name}")

        # ── Certifications ───────────────────────────────────────────
        certs = _read_csv_from_zip(zf, "Certifications.csv")
        if certs:
            console.print(f"[cyan]Found {len(certs)} certifications[/]")
            existing_certs = {c.lower() for c in profile.get("certificates", [])}
            for cert in certs:
                name = cert.get("Name", "").strip()
                if name and name.lower() not in existing_certs:
                    profile.setdefault("certificates", []).append(name)
                    console.print(f"[green]+[/] Added cert: {name}")

    return profile
