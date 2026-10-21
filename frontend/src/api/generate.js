const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

// Free hosting sleeps when idle, so the first request after a while is slow.
export const SLOW_REQUEST_MS = 8000;

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the FlowCraft server. Check your connection and try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : `Request failed (${response.status}).`);
  }
  return data;
}

export async function generateWorkflow(userInput) {
  const data = await post("/generate", { user_input: userInput });
  return data.workflow;
}

export async function explainWorkflow(workflow) {
  const data = await post("/explain", { workflow });
  return data.explanation;
}
