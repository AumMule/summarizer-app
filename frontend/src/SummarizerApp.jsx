import { useState, useEffect, useRef } from "react";
import { Upload, Copy, Download, Volume2, VolumeX, History, Trash2, ChevronRight, Check, Video, FileText } from "lucide-react";

export default function SummarizerApp() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("balanced");
  const [copied, setCopied] = useState(false);
  
  const [videoId, setVideoId] = useState(null);
  const [serverWordCount, setServerWordCount] = useState(0);
  const [rawText, setRawText] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  
  // History state
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("summarizerHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  
  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;

  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("summarizerHistory", JSON.stringify(history));
  }, [history]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "text/plain") {
        alert("Please upload a .txt file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target.result);
      reader.readAsText(file);
    }
  };

  const summarize = async () => {
    if (text.trim().length === 0) return;

    setLoading(true);
    setSummary("");
    setVideoId(null);
    setServerWordCount(0);
    setRawText("");
    setShowRaw(false);
    stopSpeaking();

    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mode: mode === "brutal" ? "short" : mode === "detailed" ? "long" : "medium",
        }),
      });

      const data = await res.json();
      
      const finalSummary = data.summary || data.notice || data.error || "No summary generated.";
      setSummary(finalSummary);
      if (data.videoId) setVideoId(data.videoId);
      if (data.originalWordCount) setServerWordCount(data.originalWordCount);
      if (data.rawTranscript) setRawText(data.rawTranscript);
      
      if (data.summary) {
        setHistory(prev => [{
          id: Date.now(),
          original: data.videoId ? `YouTube URL: ${text.substring(0, 50)}` : text.substring(0, 100) + "...",
          summary: finalSummary,
          date: new Date().toLocaleDateString(),
          mode
        }, ...prev].slice(0, 20)); // Keep last 20
      }
    } catch (err) {
      setSummary("Error: Failed to fetch summary.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const downloadContent = rawText && isYoutubeMode 
      ? `=== RAW TRANSCRIPT ===\n\n${rawText}\n\n=== AI SUMMARY ===\n\n${summary}`
      : summary;
      
    const file = new Blob([downloadContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = isYoutubeMode ? "youtube-summary.txt" : "summary.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.onend = () => setIsSpeaking(false);
      synth.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const stopSpeaking = () => {
    synth.cancel();
    setIsSpeaking(false);
  };

  const loadHistoryItem = (item) => {
    setSummary(item.summary);
    setShowHistory(false);
  };

  const clearHistory = () => {
    if(confirm("Clear all history?")) {
      setHistory([]);
    }
  };

  const getWordCount = (str) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };
  
  const displayWordCount = serverWordCount > 0 ? serverWordCount : getWordCount(text);
  const isYoutubeMode = text.includes("youtube.com") || text.includes("youtu.be");

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex">
      {/* Sidebar (History) */}
      <div className={`fixed inset-y-0 left-0 bg-[#121826] border-r border-gray-800 w-80 transform transition-transform duration-300 z-50 flex flex-col ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#0f172a]">
          <h2 className="font-semibold text-lg flex items-center gap-2"><History size={18}/> History</h2>
          <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white p-1">
            <ChevronRight size={20} className="rotate-180" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-5">No saved summaries yet.</p>
          ) : (
            history.map(item => (
              <div key={item.id} className="bg-[#1e293b] p-3 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer transition group" onClick={() => loadHistoryItem(item)}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded capitalize">{item.mode}</span>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{item.summary}</p>
              </div>
            ))
          )}
        </div>
        
        {history.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <button onClick={clearHistory} className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 py-2 rounded-lg transition">
              <Trash2 size={16} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-12 pb-24 overflow-x-hidden transition-all">
        {/* TOP LINE */}
        <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowHistory(true)} className="p-2 bg-[#121826] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition group relative">
              <History size={20} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                {history.length > 0 && <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>}
              </span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              Shortify <span className="text-blue-500 text-xl font-normal opacity-80">| AI Summarizer</span>
            </h1>
          </div>

          <div className="flex gap-2 bg-[#121826] p-1.5 rounded-xl border border-gray-700 w-full md:w-auto overflow-x-auto">
            {/* Mode selection remains similar */}
            {[
              ["brutal", "✂️ Brutal"],
              ["balanced", "🧠 Balanced"],
              ["detailed", "📚 Detailed"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  mode === key
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* CANVAS */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <textarea
              className={`w-full min-h-[260px] bg-[#121826] border rounded-2xl p-6 text-lg leading-relaxed outline-none focus:ring-1 transition shadow-sm resize-y ${isYoutubeMode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'}`}
              placeholder="Paste long text, or paste a YouTube video URL..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            {isYoutubeMode && (
              <div className="absolute top-4 right-4 bg-red-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-lg shadow-red-500/20">
                <Video size={16} /> YouTube Mode Active
              </div>
            )}

            {/* File Upload Button inside Textarea */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <span className="text-xs text-gray-500 mr-2 font-mono">
                {displayWordCount} {serverWordCount > 0 ? "words (Video Transcript)" : "words"}
              </span>
              
              <input 
                type="file" 
                accept=".txt" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs font-semibold text-gray-300 transition cursor-pointer"
                title="Upload .txt file"
              >
                <Upload size={14} /> Upload TXT
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={summarize}
              disabled={loading || text.trim().length === 0}
              className={`px-8 py-3.5 rounded-xl transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 ${
                isYoutubeMode 
                  ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isYoutubeMode ? "Extracting Video..." : "Distilling..."}
                </>
              ) : (isYoutubeMode ? "🎥 Summarize Video" : "✨ Distill Thoughts")}
            </button>
          </div>

          {/* RESULT */}
          {(summary || loading) && (
            <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end mb-4 border-b border-gray-800 pb-3">
                <h3 className="text-xl font-semibold text-gray-200">Refined Summary</h3>
                
                {/* Stats */}
                {!loading && summary && !summary.includes("Error") && (
                   <span className="text-sm font-mono text-emerald-400 bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-800/50">
                     ~{Math.max(0, displayWordCount - getWordCount(summary))} words eliminated
                   </span>
                )}
              </div>

              {videoId && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-gray-800">
                  <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt="Video Thumbnail" className="w-full h-48 md:h-64 object-cover" />
                </div>
              )}

              <div className="bg-[#0f172a] border border-blue-900/50 rounded-2xl p-6 md:p-8 shadow-lg relative group transition-all">
                {loading ? (
                   <div className="flex flex-col gap-3 min-h-[150px]">
                    <div className="flex items-center space-x-2 animate-pulse text-blue-400">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="ml-2 font-medium">Extracting and analyzing meaning...</span>
                    </div>
                    {isYoutubeMode && <p className="text-xs text-gray-500 mt-2 ml-6">This may take up to 20 seconds for long videos to avoid overloading the AI model.</p>}
                  </div>
                ) : (
                  <>
                    <p className="text-xl leading-relaxed text-gray-100 whitespace-pre-line font-medium selection:bg-blue-500/30">
                      {summary}
                    </p>

                    {/* Action Toolbar */}
                    <div className="absolute top-4 right-4 flex flex-col md:flex-row gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={toggleSpeak} className={`p-2 rounded-lg bg-gray-800 border transition cursor-pointer ${isSpeaking ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-300 hover:bg-gray-700'}`} title={isSpeaking ? "Stop speaking" : "Read aloud"}>
                        {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      
                      <button onClick={copyToClipboard} className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition cursor-pointer" title="Copy to clipboard">
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                      </button>
                      
                      <button onClick={downloadTxt} className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition cursor-pointer" title="Download text">
                        <Download size={18} />
                      </button>
                    </div>

                    {/* Full Transcript Toggler */}
                    {rawText && isYoutubeMode && (
                      <div className="mt-8 border-t border-blue-900/40 pt-4">
                         <button 
                            onClick={() => setShowRaw(!showRaw)}
                            className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition"
                         >
                            <FileText size={16} /> 
                            {showRaw ? "Hide Full Transcript" : "View Full Transcript"}
                         </button>

                         {showRaw && (
                            <div className="mt-4 p-5 bg-[#0b0f19] rounded-xl border border-blue-900/30 text-sm text-gray-400 leading-relaxed max-h-64 overflow-y-auto font-mono custom-scrollbar">
                               {rawText}
                            </div>
                         )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
