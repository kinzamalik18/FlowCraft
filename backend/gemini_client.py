import os
import time

import httpx
from dotenv import load_dotenv

# --- Step 1: Load environment variables from .env ---
# This reads GEMINI_API_KEY (and optionally GEMINI_MODEL) so keys never live in code.
load_dotenv()

BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
# Model names change over time. Override with GEMINI_MODEL instead of editing code.
DEFAULT_MODEL = "gemini-2.5-flash"
RETRY_STATUSES = {429, 500, 502, 503, 504}

JSON_SYSTEM_INSTRUCTION = """
You are an expert n8n workflow automation engineer.
Your job is to convert plain English automation requests into valid n8n workflow JSON.
Always return ONLY raw JSON. No explanation. No markdown. No code blocks. Just the JSON object.
"""


# --- Step 2: Read the API key and model from the environment ---
def get_config() -> tuple[str, str]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GEMINI_API_KEY is missing from .env")
    return api_key, os.getenv("GEMINI_MODEL", DEFAULT_MODEL)


# --- Step 3: Send the prompt to Gemini with retry logic ---
# Uses the REST API directly, so there is no SDK version to keep in sync.
# Rate limits and server errors are retried with a growing wait; other errors fail fast.
def call_gemini(
    prompt: str,
    system_instruction: str = JSON_SYSTEM_INSTRUCTION,
    json_mode: bool = True,
    retries: int = 3,
    delay: float = 2.0,
) -> str:
    api_key, model = get_config()
    payload = {
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2},
    }
    if json_mode:
        payload["generationConfig"]["responseMimeType"] = "application/json"

    last_error = None
    for attempt in range(1, retries + 1):
        try:
            response = httpx.post(
                f"{BASE_URL}/models/{model}:generateContent",
                json=payload,
                headers={"x-goog-api-key": api_key},
                timeout=60,
            )
        except httpx.HTTPError as e:
            last_error = e
        else:
            if response.status_code < 400:
                return extract_response(response.json())
            last_error = RuntimeError(f"HTTP {response.status_code}: {response.text[:200]}")
            if response.status_code not in RETRY_STATUSES:
                break
        if attempt < retries:
            time.sleep(delay * attempt)

    raise RuntimeError(f"Gemini API failed after {retries} attempts: {last_error}")


# --- Step 4: Extract the text from Gemini's response ---
# If the response is empty or blocked, raise a clear error.
def extract_response(data: dict) -> str:
    try:
        parts = data["candidates"][0]["content"]["parts"]
    except (KeyError, IndexError, TypeError):
        raise ValueError("Empty or blocked response received from Gemini.")

    text = "".join(part.get("text", "") for part in parts).strip()
    if not text:
        raise ValueError("Gemini returned an empty text response.")
    return text
