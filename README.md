# IMITATE 🎙️

**Clone any voice, make it say anything — fully local, fully free.**

IMITATE is a small webapp that lets you clone a voice from a short audio sample and generate new speech in that voice, in multiple languages. Built as a free, self-hosted alternative to paid voice-cloning services like ElevenLabs.

> Upload a voice sample (or record one directly in the browser), type what you want it to say, pick a language, and get back a cloned audio clip — all running on your own machine.

---

## ✨ Features

- 🎤 **Upload or record** a reference voice sample directly in the browser
- 🌍 **Multilingual** generation (French, English, Arabic supported)
- 🔒 **Fully local** — no external API calls, no data leaves your machine
- ⚡ **Lightweight** — runs on CPU, no GPU required
- 🎧 **Instant playback + download** of the generated audio

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, Tailwind CSS |
| Backend | FastAPI |
| Voice cloning / TTS | [Chatterbox](https://github.com/resemble-ai/chatterbox) (Multilingual) |
| Audio preprocessing | pydub, librosa, noisereduce |

---

## 📁 Project Structure

```
.
├── .vscode/          # Editor settings
├── ai/                # FastAPI backend + TTS pipeline
├── front-end/         # React (Vite) frontend
├── output/            # Generated audio files
├── requirements.txt    # Python dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11**
- **Node.js** (18+)
- **FFmpeg** installed and available on your PATH (used for audio format conversion)

### 1. Clone the repo

```bash
git clone https://github.com/HammaAnes/Voice-Imitator.git
cd Voice-Imitator
```

### 2. Backend setup

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Run the API:

```bash
cd ai
fastapi dev main.py
```

The backend will start at `http://127.0.0.1:8000` — API docs available at `http://127.0.0.1:8000/docs`.

> **Note:** on first run, the Chatterbox model weights (~a few GB) will be downloaded automatically from Hugging Face and cached locally. This only happens once.

### 3. Frontend setup

In a separate terminal:

```bash
cd front-end
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🎬 How It Works

1. Upload an audio file or record a short voice sample in the browser
2. Type the sentence you want the cloned voice to say, and pick a language
3. The backend preprocesses the audio (mono conversion, silence trimming, light noise reduction) and feeds it to Chatterbox's multilingual voice-cloning model
4. Generation runs as a background job — the frontend polls for status
5. Once ready, play the result instantly or download it

---

## ⚠️ Disclaimer

This project is intended for personal, educational, and entertainment use (pranking your Real Madrid–loving friends included). Please don't use it to impersonate real people without their consent or for any malicious purpose.

---

## 🙌 Credits

- [Chatterbox](https://github.com/resemble-ai/chatterbox) by Resemble AI — the voice cloning model powering this project
- Built by [Anas](https://portfolio-anas-gilt.vercel.app) — nightByte

---

## 📄 License

_Add your chosen license here (e.g. MIT)._
