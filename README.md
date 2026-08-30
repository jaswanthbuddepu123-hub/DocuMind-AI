🌐 Live Application

🔗 Frontend: https://docu-mind-ai-orpin.vercel.app 🔗 Backend Health Check: https://documind-ai-5xcf.onrender.com/api/health 🎥 Demo Video: [add link once recorded]

📌 Problem Statement

Organizations regularly handle large volumes of structured and unstructured documents — invoices, receipts, academic reports, contracts, and certificates. Manually reading, classifying, and extracting information from these documents is slow, inconsistent, and error-prone, which delays decision-making and increases operational overhead.

DocuMind AI solves this by automating the full document intelligence pipeline: a user uploads a document, and the platform automatically understands, classifies, extracts structured data from, validates, and generates actionable insights about that document — with zero manual data entry.

🚀 Solution

DocuMind AI is a secure, full-stack Intelligent Document Processing platform. Once a document is uploaded, it flows through a backend AI pipeline (Google Gemini) that performs document understanding, classification, structured field extraction, internal-consistency validation, and insight generation — all returned as strict, schema-validated JSON (via Zod), never trusted as free-form AI text. Results are persisted in a relational Postgres database (Supabase) and presented through a secure, authenticated dashboard where users can search, filter, review, and correct extracted data.

Beyond the core IDP pipeline, the platform includes two additional AI-assisted capabilities: a document Q&A chat ("Ask AI") for querying an uploaded document conversationally, and a natural-language Visual PDF Editor that can generate a modified version of a document based on plain-English instructions.

✨ Core Features

Intelligent Document Processing Pipeline (primary feature)

Document Understanding & Classification — automatically detects document type (invoice, receipt, academic report, etc.)
Structured Information Extraction — extracts relevant fields dynamically per document type into structured JSON
AI Output Validation — every AI response is parsed and validated against a strict Zod schema before being trusted or stored; malformed AI output is safely rejected, never silently accepted
Knowledge Discovery & Actionable Insights — AI-generated insights specific to each document's content
Confidence Scoring — every processed document reports an AI confidence percentage

Document Management

Secure upload (PDF/JPG/PNG, size-validated, MIME/extension-checked) with Multer
Full CRUD: view, search, filter, sort, edit extracted fields, and archive documents
Dashboard with real-time processing stats (total / completed / processing / failed)

Security

Custom authentication via JWT + bcrypt (Express backend) — not third-party auth
Every document/record query enforces per-user ownership at the database level
Google Gemini API key stored and used backend-only, never exposed to the frontend
Supabase Row Level Security (RLS) enabled as a defense-in-depth layer at the database level

Bonus AI Capabilities

Ask AI — conversational Q&A over an uploaded document's content
Visual PDF Editor — generates a modified version of a document from a natural-language instruction, with side-by-side original vs. transformed preview

Other

Editable user profile with account statistics and preferences
Fully responsive layout (mobile, tablet, desktop)
🏗️ System Architecture
                         USER
                           │
                           ▼
                ┌────────────────────┐
                │      FRONTEND      │   React + Vite + React Router
                │                    │   Tailwind CSS + Axios
                └─────────┬──────────┘
                          │  HTTPS REST API
                          ▼
                ┌────────────────────┐
                │      BACKEND       │   Node.js + Express.js
                │                    │   JWT + bcrypt (auth)
                │                    │   Zod (validation)
                │                    │   Multer (file uploads)
                │                    │   CORS + dotenv
                └──────┬───────┬─────┘
                       │       │
              ┌────────┘       └──────────┐
              ▼                           ▼
      ┌─────────────────┐        ┌─────────────────┐
      │    SUPABASE     │        │  GOOGLE GEMINI  │
      │  PostgreSQL     │        │  Understanding  │
      │  Storage        │        │  Classification │
      │  RLS            │        │  Extraction     │
      │                 │        │  Validation     │
      │                 │        │  Insights       │
      └─────────────────┘        └─────────────────┘

Document processing flow: Upload → File Validation (Multer) → Store (Supabase Storage) → Gemini AI (understand → classify → extract → validate → generate insights) → Parse & Validate JSON with Zod → Store Results (Postgres) → Dashboard (view / search / edit / archive)

💻 Technology Stack

Frontend

⚛️ React.js + Vite
🧭 React Router
🌊 Tailwind CSS
🔗 Axios
🎨 Lucide Icons

Backend

🟢 Node.js + Express.js
🔑 JWT (JSON Web Token) authentication
🔒 bcrypt (password hashing)
✅ Zod (input validation + strict AI output schema validation)
📎 Multer (secure file upload handling)
🌐 CORS + dotenv

Database & Storage

🟩 Supabase PostgreSQL (relational data: users, documents, document_results, document_insights)
🗄️ Supabase Storage (private bucket for uploaded files)
🔐 Row Level Security (RLS) enabled on all tables

AI

🤖 Google Gemini API (gemini-3.5-flash) — backend-only, structured JSON output mode
📦 Local Setup
Prerequisites
Node.js (v18+)
npm
Git
A Supabase project (with a documents storage bucket)
A Google Gemini API key
Installation
Clone the repository
bash
   git clone https://github.com/jaswanthbuddepu123-hub/DocuMind-AI.git
   cd DocuMind-AI
Backend setup
bash
   cd backend
   npm install
   cp .env.example .env   # then fill in real values, see below
   npm run dev
Frontend setup
bash
   cd ../frontend
   npm install
   cp .env.example .env   # then fill in real values, see below
   npm run dev
Backend runs on http://localhost:5000 (or your configured PORT), frontend on http://localhost:5173 by default.
🔒 Environment Variables

⚠️ Never commit real API keys, passwords, tokens, or credentials to GitHub. Use the .env.example files as templates — real values only ever go in your local .env, which is gitignored.

Backend (backend/.env)

env
PORT=5000
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_gemini_api_key

JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d

Frontend (frontend/.env)

env
VITE_API_BASE_URL=http://localhost:5000
📋 API Overview
Method	Endpoint	Description
POST	/api/auth/register	Create a new user account
POST	/api/auth/login	Authenticate and receive a JWT
GET	/api/auth/me	Get current authenticated user
POST	/api/documents/upload	Upload a document; triggers AI processing
GET	/api/documents	List documents (search/filter/sort/paginate)
GET	/api/documents/stats	Dashboard stats (total/completed/processing/failed)
GET	/api/documents/:id	Get a single document with extracted results & insights
PATCH	/api/documents/:id	Correct/update extracted fields
DELETE	/api/documents/:id	Archive (soft-delete) a document
GET	/api/health	Backend health check

All document routes require a valid JWT and are scoped to the authenticated user only.

Author: Buddepu Venkata Jaswanth GitHub: jaswanthbuddepu123-hub
