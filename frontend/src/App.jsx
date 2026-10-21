import { useRef, useState } from "react";

import { explainWorkflow, generateWorkflow, SLOW_REQUEST_MS } from "./api/generate";
import ExplanationPanel from "./components/ExplanationPanel";
import ExportButton from "./components/ExportButton";
import PromptInput from "./components/PromptInput";
import WorkflowCanvas from "./components/WorkflowCanvas";

export default function App() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const [workflow, setWorkflow] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState("");
  const requestId = useRef(0);

  async function build(text) {
    const value = text.trim();
    if (!value || busy) return;
    const id = ++requestId.current;
    setBusy(true);
    setError("");
    setWorkflow(null);
    setExplanation("");
    setExplainError("");
    const slowTimer = setTimeout(() => setSlow(true), SLOW_REQUEST_MS);

    try {
      const result = await generateWorkflow(value);
      if (id !== requestId.current) return;
      setWorkflow(result);
      setExplaining(true);
      explainWorkflow(result)
        .then((text) => id === requestId.current && setExplanation(text))
        .catch((e) => id === requestId.current && setExplainError(e.message))
        .finally(() => id === requestId.current && setExplaining(false));
    } catch (e) {
      if (id === requestId.current) setError(e.message);
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setBusy(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <span className="brand">FlowCraft</span>
        <a href="https://github.com/kinzamalik18/FlowCraft">Source on GitHub</a>
      </header>
      <main className="page">
        <PromptInput value={input} onChange={setInput} onSubmit={build} busy={busy} />

        <div aria-live="polite">
          {busy && (
            <p className="status">
              {slow
                ? "Waking up the server. Free hosting sleeps when nobody's using it, so this can take up to a minute."
                : "Building your workflow..."}
            </p>
          )}
          {error && <p className="error">{error}</p>}
        </div>

        {workflow && (
          <div className="result appear">
            <WorkflowCanvas workflow={workflow} />
            <div>
              <ExplanationPanel explanation={explanation} loading={explaining} error={explainError} />
              <ExportButton workflow={workflow} />
            </div>
          </div>
        )}
      </main>
      <footer>FlowCraft turns a sentence into an n8n workflow using Google Gemini. Free to use, nothing is stored.</footer>
    </>
  );
}
