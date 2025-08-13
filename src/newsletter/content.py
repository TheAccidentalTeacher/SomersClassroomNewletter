from pathlib import Path
import json
import yaml
from typing import Any, Dict

GradeKeys = {"6th": "grade6", "7th": "grade7", "8th": "grade8"}

def load_content(path: str | Path) -> Dict[str, Any]:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(p)
    text = p.read_text(encoding="utf-8")
    if p.suffix.lower() in [".yaml", ".yml"]:
        data = yaml.safe_load(text) or {}
    else:
        data = json.loads(text or "{}")

    # Normalize grades
    out: Dict[str, Any] = {
        "grade6": data.get("grade6") or data.get("6th") or [],
        "grade7": data.get("grade7") or data.get("7th") or [],
        "grade8": data.get("grade8") or data.get("8th") or [],
        "announcements": data.get("announcements", []),
        "events": data.get("events", []),
        "achievements": data.get("achievements", []),
        "week": data.get("week") or "This Week",
        "date": data.get("date"),
    }
    return out
