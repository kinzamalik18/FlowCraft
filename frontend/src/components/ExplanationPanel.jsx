import { explanationLines } from "../lib/workflow";

export default function ExplanationPanel({ explanation, loading, error }) {
  return (
    <section className="panel" aria-labelledby="explain-title">
      <h2 id="explain-title">What this workflow does</h2>
      {loading && <p className="status">Writing a plain-English summary...</p>}
      {error && <p className="error">{error}</p>}
      {explanation && (
        <ul className="explanation">
          {explanationLines(explanation).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
