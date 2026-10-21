const EXAMPLES = [
  "Send a Slack message when a new row is added to Google Sheets",
  "Email me a weather report every morning at 8am",
  "Save all Gmail attachments to Google Drive",
  "When a form is submitted, add the person to Mailchimp and notify me on Telegram",
];

const MAX = 500;

export default function PromptInput({ value, onChange, onSubmit, busy }) {
  const over = value.length > MAX;
  return (
    <form
      className="prompt"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <label htmlFor="prompt">Describe what you want automated</label>
      <textarea
        id="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(value);
          }
        }}
        placeholder="When a new row is added to Google Sheets, send a Slack message"
        rows={2}
      />
      <div className="prompt-footer">
        <div>
          <ul className="examples" aria-label="Examples">
            {EXAMPLES.map((example) => (
              <li key={example}>
                <button type="button" onClick={() => onChange(example)} disabled={busy}>
                  {example}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className={`counter ${over ? "over" : ""}`}>
            {value.length} / {MAX}
          </span>
          <button className="primary" type="submit" disabled={busy || !value.trim() || over}>
            {busy ? "Building..." : "Build workflow"}
          </button>
        </div>
      </div>
    </form>
  );
}
