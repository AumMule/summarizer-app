// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
import dotenv from "dotenv";
dotenv.config();
const HF_TOKEN = process.env.HF_TOKEN;

app.post("/summarize", async (req, res) => {
  const { text, mode } = req.body;

  let min = 50,
    max = 150;
  if (mode === "short") {
    min = 30;
    max = 80;
  } else if (mode === "medium") {
    min = 60;
    max = 120;
  } else if (mode === "long") {
    min = 100;
    max = 200;
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: { min_length: min, max_length: max },
      }),
    });

    const data = await response.json();
    res.json({ summary: data[0]?.summary_text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarization failed" });
  }
});

app.listen(5000, () => console.log("✅ Backend running on port 5000"));
