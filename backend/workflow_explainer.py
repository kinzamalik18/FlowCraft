import json
from gemini_client import call_gemini

def build_explanation_prompt(workflow: dict)->str:
    workflow_str=json.dumps(workflow,indent=2)
    return f"""
    you are an n8n workflow automation expert.
    a user has just generated the following nn workflow JSON.
    explain what this workflow does in simple, plain English.
    Be concise. Use bullet points. No technical jargon.

    workflow JSON:
    {workflow_str}
    """

def explain_workflow(workflow:dict)->str:
    prompt=build_explanation_prompt(workflow)
    return call_gemini(prompt)