# AgroGPT - Project Context & Architecture

This document serves as a complete contextual guide for the AgroGPT application. You can provide this file to any AI assistant (like ChatGPT) so it instantly understands the entire codebase, deployment architecture, and goals.

## 1. High-Level Overview
**AgroGPT** is an intelligent agricultural assistant that provides text-based farming advice and uses Machine Learning to detect plant diseases from uploaded images. 
- **Frontend**: Vanilla HTML/JS/CSS (No framework used) for maximum performance and simplicity.
- **Backend / API**: Python 3.11 with Flask.
- **LLM Engine**: Groq API (Llama-3.3-70b-versatile).
- **Computer Vision**: Locally hosted PyTorch model (`efficientnet_b0.pt`) for classification.
- **Deployment Platform**: Hugging Face Spaces (Docker).

## 2. Core Architecture & Files

### `app.py` (The Backend Server)
- Initializes the Flask server.
- Uses dynamic port binding (`port = int(os.environ.get("PORT", 7860))`) to support Hugging Face and Docker deployments seamlessly.
- **Routes**:
  - `GET /` -> Serves the `static/index.html` file natively.
  - `GET /api/status` -> Checks if the AI/Groq backend is healthy.
  - `GET /api/weather` -> Uses `weather.py` to fetch live data from Open-Meteo API.
  - `POST /api/ask` -> Handles LLM text questions and prepends live weather context to the prompt.
  - `POST /api/upload` -> Accepts user images, saves them temporarily to `/tmp`, processes them via PyTorch, pings Groq for a detailed treatment summary, and returns the data.

### `disease_detection.py` (The Vision Module)
- Handles image recognition using PyTorch and Torchvision.
- Designed to be extremely resilient. Contains fallback logic: if PyTorch is ever uninstalled or missing, the `try/except ImportError` catches it and gracefully degrades to "Simulated Detection Color Profiling."
- Maps detected IDs to detailed plant diseases via `models/classes.json`.

### `model.py` (The LLM Controller)
- Connects to the Groq API securely via `GROQ_API_KEY` loaded from the `.env` file using python-dotenv.
- Constructs complex multimodal-style prompts combining the disease label (from PyTorch) and asks to generate bilingual summaries (English, Malayalam, Tamil).

### `weather.py` (The Context Module)
- Connects to the public Open-Meteo API.
- Stores coordinates for 38 districts in Tamil Nadu to provide localized context for the AI prompt.

### `static/` (The Frontend)
- `index.html`: Holds the UI layout.
- `index.css`: Contains CSS variables and modern SaaS-style glassmorphism styling.
- `index.js`: Manages DOM interactions, the SpeechRecognition API for voice inputs, and sends `fetch()` requests to the `/api/` endpoints.

## 3. Production Deployment (Hugging Face Spaces)
The app is packaged continuously via Docker to bypass common PaaS size limits (like Vercel or Heroku).
- **Dockerfile**:
  - Pulls `python:3.11-slim`.
  - Creates a non-root Linux user (required by Hugging Face).
  - Explicitly installs the **CPU-ONLY** version of PyTorch (`--index-url https://download.pytorch.org/whl/cpu`) to keep the Docker image lightweight and fast.
  - Installs the remaining dependencies from `requirements.txt`.
  - Exposes port `7860`.
  
## 4. Current known limitations / To-Do
- Requires `GROQ_API_KEY` to be passed as an Environment Secret in the production host.
- The `models/` directory must contain the `.pt` binary payload for the PyTorch vision model.
