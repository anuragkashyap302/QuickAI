# QuickAI


[![Server](https://img.shields.io/badge/server-node-green)](#)
[![Client](https://img.shields.io/badge/client-react-blue)](#)

High-speed AI toolkit for creators and professionals — generate articles, blog titles, images, and review resumes with a single full-stack app.

QuickAI pairs a modern React + Vite frontend with a Node/Express API that integrates with LLMs (Gemini/OpenAI-compatible), image tools (ClipDrop, Cloudinary), and Clerk authentication to deliver production-level AI features.

---

**Table of Contents**
- [Demo](#demo)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [How it works (simple)](#how-it-works-simple)
- [Setup & Example Commands](#setup--example-commands)
- [API Endpoints (examples)](#api-endpoints-examples)
- [Challenges & Learnings](#challenges--learnings)
- [Contributing](#contributing)
- [License](#license)

---

## Demo

- Local development: run the client and server (commands below).
- Production preview: configured for Vercel (see `vercel.json` files in `client/` and `server/`).

## Key Features

- Generate long-form articles using Gemini/OpenAI-like chat completions.
- Generate blog post titles.
- Text-to-image generation (ClipDrop) with Cloudinary storage and publishing.
- Image tools: background removal and targeted object removal (Cloudinary transformations).
- Resume upload and automated review (PDF parsing + LLM feedback).
- Usage limits and gating (free vs premium plans via Clerk user metadata).

## Tech Stack

- Frontend: React + Vite, TailwindCSS
- Backend: Node.js (ESModules) + Express
- AI: Gemini/OpenAI-compatible API (configured via `GEMINI_API_KEY`)
- Image services: ClipDrop (text-to-image), Cloudinary (storage + transforms)
- Auth: Clerk (middleware on server, Clerk React on client)
- DB: Neon / PostgreSQL via serverless client (see `configs/db.js`)

## Architecture

The system is split into two main layers:

- Client (`client/`): React app with pages for Create, Dashboard, and Tools. It calls the server for authenticated AI operations.
- Server (`server/`): Express app that:
  - Verifies user and plan via Clerk middleware
  - Exposes AI endpoints (`/api/ai/*`) for content and image operations
  - Integrates with Cloudinary for file storage and transformations
  - Persists creations to the database (`creations` table)

Request flow (short):

1. User interacts with frontend and sends a request (e.g., generate article).
2. Client attaches authentication; server middleware checks `plan` and `free_usage`.
3. Server calls the relevant AI or image API, stores creations, and returns content/URLs.

## How it works (simple steps)

1. Authenticate with Clerk in the frontend.
2. Submit a prompt or upload a file from the UI.
3. Server validates plan & usage limits.
4. Server calls external AI/image APIs (Gemini/OpenAI, ClipDrop, Cloudinary).
5. Result saved to DB and returned to client for preview/publishing.

## Setup & Example Commands

Prerequisites: Node 18+, npm, a Cloudinary account, ClipDrop API key (for images), a Gemini/OpenAI-compatible key, Clerk account, and a Neon/Postgres DB URL.

Clone and install:

```bash
git clone <repo-url> QuickAI
cd QuickAI
```

Server (API)

```bash
cd server
npm install
# Create a .env with required variables (examples below)
npm run server    # nodemon for development
# or
npm start         # run directly
```

Client (frontend)

```bash
cd client
npm install
npm run dev
```

Example environment variables (server `.env`)

```
GEMINI_API_KEY=...
CLIP_DROP_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
DATABASE_URL=postgres://...
CLERK_SECRET_KEY=...
```

## API Endpoints (examples)

All AI endpoints are under `/api/ai` and require authenticated requests (Clerk token).

Quick reference

| Method | Path | Auth | Description |
|---|---|---:|---|
| POST | `/api/ai/generate-article` | Required | Generate an article from a prompt (saves to `creations`). |
| POST | `/api/ai/generate-blog-title` | Required | Generate blog post title(s). |
| POST | `/api/ai/generate-image` | Required (premium) | Text-to-image generation (ClipDrop → Cloudinary). |
| POST | `/api/ai/remove-image-background` | Required (premium) | Remove background from uploaded image (multipart). |
| POST | `/api/ai/remove-image-object` | Required (premium) | Remove a specific object from uploaded image (multipart). |
| POST | `/api/ai/resume-review` | Required (premium) | Upload PDF resume for LLM review (5MB limit). |

Examples (copy-paste-ready)

Generate an article

```bash
curl -X POST "https://YOUR_SERVER/api/ai/generate-article" \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Write about product-market fit for startups","length":800}'
```

Generate an image (premium only)

```bash
curl -X POST "https://YOUR_SERVER/api/ai/generate-image" \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A modern workspace with plants and soft light","publish":true}'
```

Remove image background (multipart/form-data)

```bash
curl -X POST "https://YOUR_SERVER/api/ai/remove-image-background" \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -F "image=@/path/to/photo.jpg"
```

Resume review (upload PDF)

```bash
curl -X POST "https://YOUR_SERVER/api/ai/resume-review" \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -F "resume=@./resume.pdf"
```

## Challenges & Learnings

- Rate limits & costs: balancing response length and token usage across features (article vs. title generation).
- File uploads & security: validating file size and type (resume 5MB limit enforced).
- Multi-provider integration: normalizing responses from LLMs (Gemini/OpenAI compatibility) and handling binary image APIs (ClipDrop).
- Auth + billing: gating features based on Clerk user metadata (free usage counters and premium checks).
- Testing: adding unit/integration tests for API endpoints and end-to-end flows would be a next step.


