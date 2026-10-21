import json

# Step 1: Parse the raw text from Gemini into a Python dict.
# Gemini sometimes wraps JSON in markdown fences — this strips them first.
def parse_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()

    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        cleaned = "\n".join(lines[1:-1]).strip()
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Response is not valid JSON: {e}")
    if not isinstance(data, dict):
        raise ValueError("Response must be a JSON object.")
    return data


# Step 2: Validate the top-level n8n workflow fields.
# Every valid n8n workflow must have these five keys.
def validate_workflow(data: dict) -> None:
    required_keys = {"name", "nodes", "connections", "active", "settings"}
    missing = required_keys - data.keys()
    if missing:
        raise ValueError(f"Workflow JSON missing required fields: {sorted(missing)}")
    if not isinstance(data["nodes"], list) or not data["nodes"]:
        raise ValueError("Workflow must contain at least one node.")


# Step 3: Validate each node inside the workflow.
# Each node must have these six keys to work in n8n, and names must be unique
# because n8n wires nodes together by name.
def validate_nodes(data: dict) -> None:
    required_node_keys = {"id", "name", "type", "typeVersion", "position", "parameters"}
    seen = set()
    for i, node in enumerate(data["nodes"]):
        if not isinstance(node, dict):
            raise ValueError(f"Node {i} is not an object.")
        missing = required_node_keys - node.keys()
        if missing:
            raise ValueError(f"Node {i} is missing required fields: {sorted(missing)}")
        if node["name"] in seen:
            raise ValueError(f"Two nodes are named '{node['name']}'. n8n needs unique names.")
        seen.add(node["name"])


# Step 4: Validate the connections.
# n8n connections are keyed by the source node's name and point to target node names.
# A connection to a node that doesn't exist makes the import fail, so catch it here.
def validate_connections(data: dict) -> None:
    names = {node["name"] for node in data["nodes"]}
    connections = data["connections"]
    if not isinstance(connections, dict):
        raise ValueError("'connections' must be an object keyed by node name.")
    for source, outputs in connections.items():
        if source not in names:
            raise ValueError(f"Connection starts from unknown node '{source}'.")
        for branch in outputs.get("main", []) or []:
            for target in branch or []:
                if target.get("node") not in names:
                    raise ValueError(f"'{source}' connects to unknown node '{target.get('node')}'.")


# Step 5: Main entry point — runs all validation steps and returns the clean dict.
def validate_workflow_json(raw_text: str) -> dict:
    data = parse_json(raw_text)
    validate_workflow(data)
    validate_nodes(data)
    validate_connections(data)
    return data
