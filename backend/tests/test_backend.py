import json
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import api_server  # noqa: E402
from json_validator import validate_workflow_json  # noqa: E402
from prompt_engine import process_input, sanitize_input  # noqa: E402

VALID = {
    "name": "Email to Slack",
    "active": False,
    "settings": {},
    "nodes": [
        {"id": "1", "name": "Gmail Trigger", "type": "n8n-nodes-base.gmailTrigger", "typeVersion": 1, "position": [0, 300], "parameters": {}},
        {"id": "2", "name": "Send Slack Message", "type": "n8n-nodes-base.slack", "typeVersion": 2, "position": [250, 300], "parameters": {}},
    ],
    "connections": {"Gmail Trigger": {"main": [[{"node": "Send Slack Message", "type": "main", "index": 0}]]}},
}


def test_sanitize_input_rejects_empty_and_long():
    with pytest.raises(ValueError):
        sanitize_input("   ")
    with pytest.raises(ValueError):
        sanitize_input("x" * 501)
    assert sanitize_input("  send   me   a message ") == "send me a message"


def test_prompt_includes_request_and_connection_shape():
    prompt = process_input("Email me every morning")
    assert "Email me every morning" in prompt
    assert '"connections": {"Gmail Trigger"' in prompt


def test_valid_workflow_passes():
    assert validate_workflow_json(json.dumps(VALID))["name"] == "Email to Slack"


def test_markdown_fences_are_stripped():
    assert validate_workflow_json("```json\n" + json.dumps(VALID) + "\n```")["nodes"]


@pytest.mark.parametrize(
    "mutate, message",
    [
        (lambda w: w.pop("connections"), "missing required fields"),
        (lambda w: w["nodes"][1].pop("type"), "Node 1 is missing"),
        (lambda w: w["nodes"].__setitem__(1, {**w["nodes"][1], "name": "Gmail Trigger"}), "unique"),
        (lambda w: w["connections"]["Gmail Trigger"]["main"][0][0].__setitem__("node", "Ghost"), "unknown node 'Ghost'"),
        (lambda w: w.__setitem__("nodes", []), "at least one node"),
    ],
)
def test_invalid_workflows_are_rejected(mutate, message):
    workflow = json.loads(json.dumps(VALID))
    mutate(workflow)
    with pytest.raises(ValueError, match=message):
        validate_workflow_json(json.dumps(workflow))


def test_generate_retries_once_on_invalid_json(monkeypatch):
    replies = iter(["not json", json.dumps(VALID)])
    monkeypatch.setattr(api_server, "call_gemini", lambda prompt: next(replies))
    response = TestClient(api_server.app).post("/generate", json={"user_input": "Slack me new emails"})
    assert response.status_code == 200
    assert response.json()["workflow"]["name"] == "Email to Slack"


def test_generate_gives_up_after_two_invalid_answers(monkeypatch):
    monkeypatch.setattr(api_server, "call_gemini", lambda prompt: "[]")
    response = TestClient(api_server.app).post("/generate", json={"user_input": "Slack me new emails"})
    assert response.status_code == 422


def test_generate_rejects_empty_input():
    assert TestClient(api_server.app).post("/generate", json={"user_input": " "}).status_code == 400


def test_explain(monkeypatch):
    monkeypatch.setattr(api_server, "explain_workflow", lambda wf: "- Watches Gmail")
    response = TestClient(api_server.app).post("/explain", json={"workflow": VALID})
    assert response.json() == {"explanation": "- Watches Gmail"}
