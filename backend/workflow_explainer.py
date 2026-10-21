import json
from gemini_client import call_gemini

EXPLAIN_SYSTEM_INSTRUCTION = """
You explain n8n automation workflows to people who have never used n8n.
Write plain English. No JSON, no code, no technical jargon.
"""


def build_explanation_prompt(workflow: dict) -> str:
    workflow_str = json.dumps(workflow, indent=2)
    return f"""
    A user has just generated the following n8n workflow JSON.
    Explain what this workflow does, one short bullet per step, in the order the steps run.
    Start each bullet with "- ". Mention anything the user must set up first,
    such as connecting an account. Keep it under 8 bullets.

    Workflow JSON:
    {workflow_str}
    """


def explain_workflow(workflow: dict) -> str:
    prompt = build_explanation_prompt(workflow)
    return call_gemini(prompt, system_instruction=EXPLAIN_SYSTEM_INSTRUCTION, json_mode=False)
