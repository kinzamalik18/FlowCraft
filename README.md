# FlowCraft 🔧

> Describe your automation in plain English. FlowCraft turns it into a ready-to-import n8n workflow — instantly, for free.

![GitHub stars](https://img.shields.io/github/stars/kinzamalik18/FlowCraft?style=social)
![GitHub forks](https://img.shields.io/github/forks/kinzamalik18/FlowCraft?style=social)
![License](https://img.shields.io/badge/license-MIT-blue)
![Made with Python](https://img.shields.io/badge/backend-Python%20%2B%20FastAPI-green)
![Made with React](https://img.shields.io/badge/frontend-React%20%2B%20React%20Flow-blue)

---

## What is FlowCraft?

FlowCraft is an AI-powered automation workflow generator. You type what you want automated in plain English — no technical knowledge needed — and FlowCraft generates a valid n8n workflow JSON you can import directly into your n8n instance in one click.

**No coding. No drag-and-drop node hunting. Just describe it, download it, done.**

---

## Demo

Type something like:

> *"Send me a Slack message every time I receive an email from my boss"*

And FlowCraft will:

- Parse your intent using the **Google Gemini API**
- Generate a complete **n8n-compatible workflow JSON**
- Render it as a **visual node canvas** so you can see exactly what it does
- Let you **export and import** it into n8n in one click

---

## Features

- **Plain English input** — no technical jargon required
- **Live visual canvas** — see your workflow as a node graph using React Flow
- **One-click JSON export** — drag the file straight into n8n
- **Step-by-step explanation** — every node explained in plain English below the canvas
- **Example prompts** — click to try pre-built workflow ideas instantly
- **100% free to use** — powered by Google Gemini's free API tier

---

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React + React Flow | Vercel (free) |
| Backend | FastAPI (Python) | Railway (free) |
| AI Engine | Google Gemini API | AI Studio (free) |
| Version Control | Git + GitHub | GitHub (free) |

> **Total hosting cost: ₹0 / $0**

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A free [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone the repo

```bash
git clone https://github.com/kinzamalik18/FlowCraft.git
cd FlowCraft
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_google_ai_studio_key_here
```

Run the backend:

```bash
uvicorn main:app --reload
```

Backend will be live at `http://localhost:8000`

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

Frontend will be live at `http://localhost:5173`

---

## How It Works

```
User types plain English
        ↓
  FastAPI receives request
        ↓
  Gemini API is called with
  a carefully engineered prompt
  that includes the n8n JSON schema
        ↓
  Response is validated against
  the n8n node structure
        ↓
  Valid JSON returned to frontend
        ↓
  React Flow renders the visual canvas
  + JSON export becomes available
```

The core "intelligence" lives entirely in the prompt engineering inside `backend/main.py`. No model training, no GPU, no datasets — just smart prompting of an existing LLM.

---

## Project Structure

```
flowcraft/
├── backend/
│   ├── main.py              # FastAPI app + Gemini call + prompt engineering
│   ├── validator.py         # n8n JSON schema validator
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── PromptInput.jsx       # Text input + example prompts
│   │   │   ├── WorkflowCanvas.jsx    # React Flow canvas
│   │   │   ├── ExplanationPanel.jsx  # Plain-English step breakdown
│   │   │   └── ExportButton.jsx      # JSON download
│   │   └── api/
│   │       └── generate.js           # API call to backend
│   ├── package.json
│   └── .env.local.example
└── README.md
```

---

## Example Prompts to Try

- *"Send a Slack message when a new row is added to Google Sheets"*
- *"Email me a daily weather report every morning at 8am"*
- *"Post a tweet automatically when I publish a new blog post"*
- *"Save all Gmail attachments to Google Drive automatically"*
- *"Notify me on WhatsApp when my website goes down"*

---

## Roadmap

- [ ] Plain English → n8n JSON generation
- [ ] Visual React Flow canvas
- [ ] JSON export
- [ ] Step-by-step explanation panel

---

## Why I Built This

Automation tools like n8n are incredibly powerful but building workflows still requires technical knowledge. Most people who could benefit from automation never get started because the learning curve feels steep.

FlowCraft removes that barrier entirely. If you can describe what you want in a sentence, you can automate it.

This project was built as part of my final-year IT portfolio to demonstrate practical application of LLMs, prompt engineering, and modern web development all on a zero-cost infrastructure stack.

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "Add: your feature description"

# Push and open a Pull Request
git push origin feature/your-feature-name
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Connect

**Built by Kinza — CS Student, PUCIT**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Kinzul%20Eman-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kinzul-eman18/)
[![GitHub](https://img.shields.io/badge/GitHub-kinzamalik18-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kinzamalik18)

> If this project helped you or inspired you, consider giving it a star ⭐ — it genuinely helps with visibility!
