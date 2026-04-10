// api/server.js
import fetch from "node-fetch";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { YoutubeTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// For debugging
console.log("HF_TOKEN available:", !!process.env.HF_TOKEN);

// Middleware
app.use(cors());
app.use(express.json());

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Helper for HF API call
async function callHF(textChunk, min, max) {
  const HF_API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn";
  const r = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: textChunk,
      parameters: { min_length: min, max_length: max },
    }),
  });
  return await r.json();
}

// API endpoint
app.post('/api', async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, mode } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: "No text provided" });

    // Length tuning by mode
    let min = 50, max = 150;
    if (mode === "short") { min = 30; max = 60; }
    else if (mode === "medium") { min = 50; max = 120; }
    else if (mode === "long") { min = 80; max = 180; }

    let processText = text;
    let videoId = null;

    // 1. YouTube Detection
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = text.match(ytRegex);

    if (ytMatch) {
      videoId = ytMatch[1];
      console.log("YouTube URL detected. Fetching transcript for:", videoId);
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        if (!transcript || transcript.length === 0) throw new Error("Empty transcript");
        processText = transcript.map(t => t.text).join(" ");
      } catch (err) {
        console.error("Transcript error:", err.message);
        return res.status(400).json({ 
          error: "Could not fetch YouTube transcript. The video might not have English subtitles." 
        });
      }
    }

    // 2. Chunking Logic
    const words = processText.split(/\s+/);
    const CHUNK_SIZE = 800; // Safe chunk size for BART limit
    const chunks = [];
    
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      chunks.push(words.slice(i, i + CHUNK_SIZE).join(" "));
    }

    // Limit to first 4 chunks (around 3200 words / 20 mins of video) to respect free-tier API limits safely
    const MAX_CHUNKS = 4;
    const processingChunks = chunks.slice(0, MAX_CHUNKS);

    let finalSummaries = [];

    // Process each chunk sequentially
    for (let i = 0; i < processingChunks.length; i++) {
      console.log(`Processing chunk ${i+1}/${processingChunks.length}...`);
      const data = await callHF(processingChunks[i], min, max);

      // Handle model loading/error responses
      if (data?.error) {
        if (typeof data.error === 'string' && data.error.includes("currently loading")) {
           return res.status(202).json({ summary: null, notice: `Model is waking up (Chunk ${i+1}): ` + data.error });
        }
        throw new Error(data.error.constructor === String ? data.error : JSON.stringify(data.error));
      }

      if (data[0] && data[0].summary_text) {
        finalSummaries.push(data[0].summary_text);
      }
    }

    // 3. Assemble Final Content
    let resultSummary = finalSummaries.join("\n\n");
    if (processingChunks.length < chunks.length) {
      resultSummary += "\n\n*(Note: Video was very long. Summarized the first " + MAX_CHUNKS * CHUNK_SIZE + " words...)*";
    }

    return res.status(200).json({ 
      summary: resultSummary, 
      videoId,
      originalWordCount: words.length
    });

  } catch (err) {
    console.error("Summarize error:", err);
    return res.status(500).json({ error: err.message });
  }
});
