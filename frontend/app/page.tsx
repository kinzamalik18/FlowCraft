"use client";

import { useState } from "react";
import WorkflowCanvas from "./components/WorkflowCanvas";
import JsonExporter from "./components/JsonExporter";

// Step 1: Define the shape of the workflow data we get back from the   API.
type Workflow = Record<string, unknown>;

export default function Home() {
  const [input, setInput] = useState("");
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [explanation, setExplanation] = useState<string |
    null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Step 2: Call the /generate endpoint with the user's input.      
  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setWorkflow(null);
    setExplanation(null);

    try {
      const res = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to generate workflow");
      }

      const data = await res.json();
      setWorkflow(data.workflow);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went      
  wrong");
      } finally {
      setLoading(false);
    }
  }

  // Step 3: Call the /explain endpoint with the generated workflow. 
  async function handleExplain() {
    if (!workflow) return;
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow }),
      });

      const data = await res.json();
      setExplanation(data.explanation);
    } catch {
      setError("Failed to fetch explanation");
    } finally {
      setLoading(false);
    }
  }

  // Step 4: Render the UI — input, buttons, canvas, explanation, and   exporter.
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">FlowCraft</h1>
      <p className="text-gray-400 mb-6">Describe your automation and
        get an n8n workflow instantly.</p>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. When I get a Gmail, post it to Slack"
          className="flex-1 bg-gray-800 border border-gray-700       
  rounded-lg px-4 py-2 text-white placeholder-gray-500
  focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700
  disabled:opacity-50 px-6 py-2 rounded-lg font-medium"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {workflow && (
        <>
          <WorkflowCanvas workflow={workflow} />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleExplain}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700
  disabled:opacity-50 px-5 py-2 rounded-lg font-medium"
            >
              Explain Workflow
            </button>
            <JsonExporter workflow={workflow} />
          </div>

          {explanation && (
            <div className="mt-6 bg-gray-800 border border-gray-700  
  rounded-lg p-5">
              <h2 className="text-lg font-semibold
  mb-2">Explanation</h2>
              <p className="text-gray-300
  whitespace-pre-line">{explanation}</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}