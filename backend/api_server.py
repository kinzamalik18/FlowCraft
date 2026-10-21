import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prompt_engine import process_input
from gemini_client import call_gemini
from json_validator import validate_workflow_json
from workflow_explainer import explain_workflow

app = FastAPI(title="FlowCraft API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    user_input: str


class ExplainRequest(BaseModel):
    workflow: dict


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
def generate_workflow(request: GenerateRequest):
    try:
        prompt = process_input(request.user_input)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # One retry: generated JSON sometimes has a broken connection or missing field,
    # and telling the model what was wrong usually fixes it.
    last_error = None
    for attempt in range(2):
        try:
            raw_response = call_gemini(prompt if attempt == 0 else f"{prompt}\nYour last answer was invalid: {last_error}. Fix it.")
            workflow = validate_workflow_json(raw_response)
            return {"workflow": workflow}
        except ValueError as e:
            last_error = str(e)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"The AI service failed: {e}")
    raise HTTPException(status_code=422, detail=f"Couldn't build a valid workflow: {last_error}")


@app.post("/explain")
def explain(request: ExplainRequest):
    try:
        explanation = explain_workflow(request.workflow)
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"The AI service failed: {e}")
