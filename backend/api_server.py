from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prompt_engine import process_input
from gemini_client import call_gemini
from json_validator import validate_workflow_json
from workflow_explainer import explain_workflow

app= FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],

)

class GenerateRequest(BaseModel):
    user_input:str

class ExplainRequest(BaseModel):
    workflow: dict

@app.post("/generate")
def generate_workflow(request: GenerateRequest):
    try:
        prompt= process_input(request.user_input)
        raw_response=call_gemini(prompt)
        workflow=validate_workflow_json(raw_response)
        return {"workflow":workflow}
    except ValueError as e:
        raise HTTPException(status_code=400,detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@app.post("/explain")
def explain(request:ExplainRequest):
    try:
        explanation = explain_workflow(request.workflow)
        return {"explanation":explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

