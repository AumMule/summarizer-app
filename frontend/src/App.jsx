import React, { useState } from "react";

export default function SummarizerApp() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("short"); // short | medium | long
  const [darkMode, setDarkMode] = useState(false);

  const handleSummarize = async () => {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 50) {
      alert("Please enter at least 50 words for better summarization.");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });
      const data = await res.json();
      setSummary(data.summary || "No summary generated.");
    } catch (err) {
      console.error(err);
      alert("Error generating summary!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    alert("Copied to clipboard!");
  };

  const inputWordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const outputWordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } min-h-screen flex flex-col items-center p-6 transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-6xl mb-4">
        <h1 className="text-2xl font-bold">AI Text Summarizer</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center w-full max-w-6xl bg-white dark:bg-gray-800 shadow-md rounded-md p-3 border border-gray-200 mb-4">
        <div className="flex space-x-2">
          {["short", "medium", "long"].map((opt) => (
            <button
              key={opt}
              onClick={() => setMode(opt)}
              className={`px-3 py-1 rounded-md capitalize ${
                mode === opt
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Words: {inputWordCount}
        </p>
      </div>

      {/* Main Content Area (Side by Side) */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-6">
        {/* Input Box */}
        <div
          className={`flex-1 p-4 rounded-lg shadow-md border border-gray-300 ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
        >
          <h2 className="text-lg font-semibold mb-2">Input Text</h2>
          <textarea
            className={`w-full h-80 p-3 rounded-md resize-none outline-none border ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-gray-100 text-gray-900 border-gray-300"
            }`}
            placeholder="Paste or type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>

        {/* Output Box */}
        <div
          className={`flex-1 p-4 rounded-lg shadow-md border border-gray-300 relative ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
        >
          <h2 className="text-lg font-semibold mb-2 flex justify-between">
            Summary
            {summary && (
              <button
                onClick={handleCopy}
                className="text-sm bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Copy
              </button>
            )}
          </h2>
          <div
            className={`h-80 p-3 rounded-md overflow-auto border ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-gray-100 text-gray-900 border-gray-300"
            }`}
          >
            {loading ? (
              <p className="text-center text-gray-400 mt-32">Generating summary...</p>
            ) : (
              <p className="whitespace-pre-line">
                {summary || "Your summary will appear here."}
              </p>
            )}
          </div>
          {summary && (
            <p className="text-sm mt-2 text-right text-gray-600 dark:text-gray-300">
              Summary words: {outputWordCount}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
