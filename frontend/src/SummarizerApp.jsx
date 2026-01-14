import { useState } from "react";

export default function SummarizerApp() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("balanced");

  const summarize = async () => {
    if (text.trim().split(/\s+/).length < 50) {
      alert("Give me a bit more text to work with.");
      return;
    }

    setLoading(true);
    setSummary("");

    const res = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        mode: mode === "brutal" ? "short" : mode === "detailed" ? "long" : "medium",
      }),
    });

    const data = await res.json();
    setSummary(data.summary || data.notice || "No summary generated.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white px-6 pt-20">
      {/* TOP LINE */}
      <div className="max-w-4xl mx-auto mb-10 flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Turn long thoughts into <span className="text-blue-500">clear ideas</span>.
        </h1>

        <div className="flex gap-2 bg-[#121826] p-1 rounded-xl border border-gray-700">
          {[
            ["brutal", "✂️ Brutal"],
            ["balanced", "🧠 Balanced"],
            ["detailed", "📚 Detailed"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`px-4 py-1.5 rounded-lg text-sm transition ${
                mode === key
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* CANVAS */}
      <div className="max-w-4xl mx-auto">
        <textarea
          className="w-full min-h-[260px] bg-transparent border border-gray-700 rounded-2xl p-6 text-lg leading-relaxed outline-none focus:border-blue-600 transition"
          placeholder="Paste your thoughts here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-6 text-center">
          <button
            onClick={summarize}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium disabled:opacity-50"
          >
            {loading ? "Distilling…" : "Distill Thoughts →"}
          </button>
        </div>

        {/* RESULT */}
        {(summary || loading) && (
          <div className="mt-16 border-t border-gray-800 pt-10">
            <p className="text-sm text-gray-500 mb-3">Result</p>

            {loading ? (
              <p className="text-gray-400 italic">
                Extracting meaning…
              </p>
            ) : (
              <p className="text-xl leading-relaxed whitespace-pre-line">
                {summary}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
