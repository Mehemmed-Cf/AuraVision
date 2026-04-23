"""
AURA mock API — serves static barrier / air-quality data only.
Privacy: do NOT accept `user_profiles` or PII in request bodies; process profiles locally on clients.
"""

import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parent.parent
MOCK_JSON = ROOT / "src" / "data" / "mockdatas.json"

app = FastAPI(title="AURA Mock API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/mock-data")
def mock_data():
    """Returns bundled mock JSON (no user profiles accepted from client)."""
    if not MOCK_JSON.is_file():
        return {"error": "mockdatas.json not found", "path": str(MOCK_JSON)}
    with MOCK_JSON.open(encoding="utf-8") as f:
        return json.load(f)
