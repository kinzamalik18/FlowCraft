import os
import time
import google.generativeai as genai
from dotenv import load_dotenv

# --- Step 1: Load environment variables from .env ---
# This reads GEMINI_API_KEY from the .env file so it never lives in code.
load_dotenv()


# --- Step 2: Configure the Gemini client ---
# Pulls the key from the environment and authenticates with Google's API.
def configure_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GEMINI_API_KEY is missing from .env")
    genai.configure(api_key=api_key)


# --- Step 3: Send the prompt to Gemini with retry logic ---
# Tries up to 3 times with a short wait between attempts.
# If all attempts fail, it raises the last error so the caller knows something went wrong.
def call_gemini(prompt: str, retries: int = 3, delay: float = 2.0) -> str:
    configure_gemini()
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction="""
        You are an expert n8n workflow automation engineer.
        Your job is to convert plain English automation requests into valid n8n workflow JSON.
        Always return ONLY raw JSON. No explanation. No markdown. No code blocks. Just the JSON object.
        """
    )

    last_error = None
    for attempt in range(1, retries + 1):
        try:
            response = model.generate_content(prompt)
            return extract_response(response)
        except Exception as e:
            last_error = e
            if attempt < retries:
                time.sleep(delay)

    raise RuntimeError(f"Gemini API failed after {retries} attempts: {last_error}")


# --- Step 4: Extract the text from Gemini's response ---
# Gemini returns a response object — this safely pulls out the text content.
# If the response is empty or blocked, it raises a clear error.
def extract_response(response) -> str:
    if not response or not response.candidates:
        raise ValueError("Empty response received from Gemini.")

    text = response.text.strip()

    if not text:
        raise ValueError("Gemini returned an empty text response.")

    return text
