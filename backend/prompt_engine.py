SYSTEM_INSTRUCTION = """
You are an expert n8n workflow automation engineer.
Your job is to convert plain English automation requests into valid n8n workflow JSON.

Always return ONLY raw JSON . No explanation.  No markdown.
No code blocks. Just the JSON object.
"""
def build_prompt(user_input: str) -> str:
    return f"""
    You are an n8n workflow automation expert.
    Convert the following automation request into a valid n8n workflow JSON object.
    Automation request:
    \"{user_input}\"
    Rules:
    -Return ONLY valid JSON. No explanation, no markdown, no code 
    fences.
    -The JSON must have :"name", "nodes", "connections",
    "active","settings".
    -Each node must have: "id", "name", "type", "typeVersion",
    "position", "parameters".
    -use realistic n8n node types like n8n-nodes-base.gmail,
    n8n-nodes-base.slack, n8n-nodes-base.httpRequest,etc.
    -Connections must wire nodes together in logical order.
    """
def sanitize_input(user_input: str) -> str:
    if not user_input or  not user_input.strip():
        raise ValueError("Input cannot be empty.")

    cleaned = user_input.strip()
    cleaned = " ".join(cleaned.split())

    if len(cleaned)>500:
        raise ValueError("Input too long. Keep it under 500 characters.")
    return cleaned

def process_input(user_input: str) -> str:
    cleaned = sanitize_input(user_input)
    return build_prompt(cleaned)
