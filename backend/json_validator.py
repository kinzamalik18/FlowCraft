import json

# Step 1: Parse the raw text from Gemini into a Python dict.
  # Gemini sometimes wraps JSON in markdown fences — this strips them  first
def parse_json(raw_text:str)->dict:
    cleaned = raw_text.strip()

    if cleaned.startswith("```"):
        lines=cleaned.splitlines()
        cleaned="\n".join(lines[1:-1]).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Response is not valid JSON:{e}")

# Step 2: Validate the top-level n8n workflow fields.
# Every valid n8n workflow must have these five keys

def validate_workflow(data: dict)->None:
    required_keys={"name","nodes","connections","active","settings"}
    missing=required_keys-data.keys()
    if missing:
        raise ValueError(f"Workflow JSON missing required fields:{missing}")

  # Step 3: Validate each node inside the workflow.
  # Each node must have these six keys to work in n8n.
def validate_nodes(data: dict) -> None:
    required_node_keys = {"id","name","type","typeVersion","position", "parameters"}
    for i, node in enumerate(data.get("nodes",[])):
        missing=required_node_keys - node.keys()
        if missing:
            raise ValueError(f"Node {i} is missing required fields:{missing}")

# Step 4: Main entry point — runs all validation steps and returns the clean dict. 
def validate_workflow_json(raw_text: str) -> dict:
    data = parse_json(raw_text)
    validate_workflow(data)
    validate_nodes(data)
    return data

