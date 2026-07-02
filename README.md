# StudyMate — Hybrid AI Study Companion

## Problem Statement
<!-- Paste your Round 1 problem statement text here -->

## Our Approach
<!-- 2-3 sentences: how StudyMate solves it -->

## Architecture
<!-- Paste/link the architecture diagram -->

## Tech Stack
- **RAG:** LangChain, ChromaDB, sentence-transformers (all-MiniLM-L6-v2)
- **Agent:** LangGraph (ReAct agent), Groq (LLM)
- **Vision:** Groq vision model
- **Web Search:** DuckDuckGoSearchRun, WikipediaQueryRun
- **UI:** Gradio
- **Deployment:** Hugging Face Spaces

## Dataset Sources
<!-- Link/name the actual PDFs, sample notes, or datasets used for the demo -->

## Setup Instructions
```bash
git clone https://github.com/<your-username>/studymate-hackathon.git
cd studymate-hackathon
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # then fill in your GROQ_API_KEY
python ingest.py           # index sample PDFs
python app.py               # launch the Gradio app
```

## Deployment Link
<!-- Add your Hugging Face Spaces / Streamlit Cloud link here -->

## Team
- Dhanya — RAG & document ingestion
- Vanshi — Agent, vision, UI & deployment
