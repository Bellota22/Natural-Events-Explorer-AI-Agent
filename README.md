# Natural Events Explorer + AI Agent (DigitalOcean Gradient™ AI Hackathon)

A full-stack app to **explore natural events** on an **interactive map** and get a **clear, actionable explanation** powered by an **AI Agent** integrated with **DigitalOcean Gradient™ AI**.

Hackathon: DigitalOcean Gradient™ AI Hackathon  
Deadline: March 18, 2026 — 4:00pm GMT-5

---

## ✨ What this project does

- Interactive map to explore natural events (wildfires, storms, volcanoes, etc.)
- Internal API routes to keep the frontend simple:
  - `/api/eonet/categories`
  - `/api/eonet/events`
  - `/api/eonet/events/[id]`
- AI Agent endpoint to explain events:
  - `/api/agent/explain`
  - Generates: summary + context + recommendations + plain-language explanation
- Multi-language support with a language toggle

---

## 🧱 Tech stack

- Next.js (App Router) + TypeScript
- Leaflet (map)
- DigitalOcean Gradient™ AI (AI Agent / inference)
- NASA EONET (events data source)

---

## 🗂️ Project structure (high level)

    src/
      app/
        api/
          agent/explain/route.ts
          eonet/
            categories/route.ts
            events/route.ts
            events/[id]/route.ts
        explore/page.tsx
        page.tsx
      components/
        EventsMap.tsx
        RagAnswer.tsx
        LanguageToggle.tsx
      lib/
        geo.ts
        i18n.ts
        types.ts
        useLocalStorageState.ts

---

## 🚀 Run locally

### 1) Requirements
- Node.js (LTS recommended)
- npm (or pnpm/yarn)

### 2) Environment variables

Copy the example file:

    cp .env.example .env

Your `.env.example` contains:

    DO_AGENT_ACCESS_KEY=
    DO_AGENT_ENDPOINT=

Fill them in your local `.env`:

- `DO_AGENT_ACCESS_KEY`: DigitalOcean Gradient™ AI Agent access key/token
- `DO_AGENT_ENDPOINT`: Agent endpoint URL (the inference endpoint you created)

> Important: never commit `.env` to the repository.

### 3) Install dependencies

    npm install

### 4) Start the dev server

    npm run dev

Open:

    http://localhost:3000

---

## 🔌 API Endpoints

### EONET (proxy / aggregation)
- GET `/api/eonet/categories`
- GET `/api/eonet/events`
- GET `/api/eonet/events/:id`

### AI Agent
- POST `/api/agent/explain`

Example request body:

    {
      "eventId": "EONET_EVENT_ID",
      "language": "en",
      "question": "Explain this event in simple terms and what I should monitor"
    }

---

## 🧠 How DigitalOcean Gradient™ AI is used

The Gradient™ AI integration is centralized in:

    src/app/api/agent/explain/route.ts

The goal is to transform event metadata (category, dates, location, and relevant details) into:
- An executive-friendly summary
- A plain-language explanation
- Common risks/implications based on event type
- Practical next steps (what to monitor / what to check next)

---

## ✅ Submission checklist (Hackathon)

- Public repository with full source code and setup instructions
- Open source LICENSE file (MIT recommended)
- Public demo video (~3 minutes) on YouTube/Vimeo/Facebook Video
- (Optional) Public live demo URL

---

## 🎥 Suggested demo video flow (≈ 3 minutes)

1. Open `/explore` and show the map with active events.
2. Select an event and show its details.
3. Ask the AI Agent: “Explain this for a non-technical audience” / “What should I monitor?”
4. Switch language with the toggle and repeat one query.
5. Close with architecture: EONET → Next.js API routes → Gradient AI Agent → UI.

---

## 📄 License

Add a `LICENSE` file (MIT recommended) to comply with the open-source requirement.

---

## 👤 Author

Gabriel Villanueva Vega
