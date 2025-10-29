// api/server.js
import fetch from "node-fetch";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// API endpoint
app.post('/api', async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, mode } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: "No text provided" });

    // length tuning by mode
    let min = 50, max = 150;
    if (mode === "short") { min = 30; max = 80; }
    else if (mode === "medium") { min = 60; max = 120; }
    else if (mode === "long") { min = 100; max = 200; }

    const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

    const r = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: { min_length: min, max_length: max },
      }),
    });

    const data = await r.json();

    // handle model loading / error responses
    if (data?.error) {
      // if model loading message, return a helpful message
      return res.status(202).json({ summary: null, notice: data.error });
    }

    return res.status(200).json({ summary: data[0]?.summary_text || null });
  } catch (err) {
    console.error("Summarize error:", err);
    return res.status(500).json({ error: "Summarization failed" });
  }
});
