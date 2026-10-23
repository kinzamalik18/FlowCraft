import { explanationParts } from "../lib/workflow";

export default function ExplanationPanel({ explanation, loading, error }) {
  const { intro, items } = explanation ? explanationParts(explanation) : { intro: [], items: [] };
  return (
    <section className="panel" aria-labelledby="explain-title">
      <h2 id="explain-title">What this workflow does</h2>
      {loading && <p className="status">Writing a plain-English summary...</p>}
      {error && <p className="error">{error}</p>}
      {intro.map((line, i) => (
        <p key={i} className="explanation-intro">{line}</p>
      ))}
      {items.length > 0 && (
        <ul className="explanation">
          {items.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
