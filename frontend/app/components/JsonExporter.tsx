"use client";

import { useState } from "react";

type Props = {
    workflow: Record<string, unknown>;
};

export default function JsonExporter({ workflow }: Props) {
    const [copied, setCopied] = useState(false);

    const json = JSON.stringify(workflow, null, 2);

    // Step 1: Copy the JSON to the user's clipboard.
    async function handleCopy() {
        await navigator.clipboard.writeText(json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // Step 2: Trigger a file download of the JSON.
    function handleDownload() {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "workflow.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={handleCopy}
                className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg   font-medium"
            >
                {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button
                onClick={handleDownload}
                className="bg-green-700 hover:bg-green-600 px-5 py-2
  rounded-lg font-medium"
            >
                Download JSON
            </button>
        </div>
    );
}