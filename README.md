<div align="center">
  <br />
  <h1>⚡ Shortify | AI Summarizer</h1>
  <p>
    <strong>A full-stack AI application that bypasses standard LLM token limits to extract and summarize massive texts and YouTube videos natively.</strong>
  </p>
</div>

<br />

## 🚀 Overview

**Shortify** is a production-level React & Node.js application built to instantly generate readable, distilled summaries from long arrays of text. Instead of relying on expensive APIs to fetch YouTube transcripts, Shortify uses custom backend web scraping of the `ytInitialPlayerResponse` payload to bypass official limitations and natively process closed captions.

When passing extensive transcripts to the AI, Shortify implements a **"Chunking Algorithm"**. It calculates array strings, divides them evenly under the 1000-token restriction of the Hugging Face Inference engine, processes them concurrently, and stitches the mini-summaries into a polished master summary completely avoiding API failure points.

## ✨ Features

* 🎥 **YouTube Intelligence:** Paste any valid YouTube URL, and the Node.js backend intercepts the connection to scrape hidden `.xml` closed-caption rails without official API keys.
* 🧠 **Bypass Token Limits:** Custom array chunking securely bypasses the `facebook/bart-large-cnn` max context window, allowing extremely long video processing.
* 🔊 **Native Text-To-Speech:** Utilizes the Web Speech API window synth object to audibly dictate the summary.
* 💾 **Session Caching:** Leverages browser `localStorage` binding to cache up to 20 historical sessions with metadata automatically in a sidebar drawer.
* 📄 **File Handling:** Directly parse and read local `.txt` documents via the `FileReader` DOM API.

## 🛠️ Tech Stack

* **Frontend:** React JS (Vite), Tailwind CSS, Lucide React (Icons).
* **Backend:** Node.js, Express.js, CORS, youtube-transcript.
* **AI Subsystem:** Hugging Face Inference API (`facebook/bart-large-cnn`).

## 💻 Running the App Locally

Because this relies heavily on overriding API throttling mechanics, you will need to boot both the Frontend UI and Backend logic server simultaneously on two different terminals.

### 1. Prerequisites 
You will require a free Hugging Face Inference API Token.
Inside the `/api` directory, create a `.env` file and structure it exactly like:
```env
HF_TOKEN=hf_your_token_goes_here
```

### 2. Boot the API Server
Open Terminal 1 and initialize the API:
```bash
cd api
npm install
npm start
```
*(Server attaches directly to localhost:3000)*

### 3. Boot the Frontend Client
Open Terminal 2 and initialize the Vite engine:
```bash
cd frontend
npm install
npm run dev
```
*(Client runs on localhost:5173)*

## 💡 System Design Notes
Instead of building a simple "Prompt-and-Wait" web app, Shortify was systematically engineered to address real challenges inherent to commercial LLM software: 
1. **Context Window Limitations:** Solved by mapping array slices and firing sequential localized promise batches.
2. **Third-Party Transcribing Costs:** Solved by mimicking headless browser requests against YouTube's native data payloads.

<br />
<div align="center">
  <i>Built with full-stack Node.js and React architecture.</i>
</div>
