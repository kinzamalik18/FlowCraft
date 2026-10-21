import { useState } from "react";

function fileName(name = "workflow") {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workflow"}.json`;
}

export default function ExportButton({ workflow }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(workflow, null, 2);

  const download = () => {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName(workflow.name);
    link.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      download(); // clipboard blocked: fall back to a file
    }
  };

  return (
    <section className="panel" aria-labelledby="export-title">
      <h2 id="export-title">Use it in n8n</h2>
      <div className="actions">
        <button className="primary" onClick={download}>
          Download JSON
        </button>
        <button className="secondary" onClick={copy}>
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </div>
      <h3>How to import</h3>
      <ol className="steps">
        <li>Open n8n and create a new workflow.</li>
        <li>Paste the copied JSON onto the canvas, or choose Import from File.</li>
        <li>Connect your accounts in each node that needs them.</li>
        <li>Test it, then turn the workflow on.</li>
      </ol>
      <p className="note">Generated workflows are a starting point. Check each node&apos;s settings before turning it on.</p>
    </section>
  );
}
