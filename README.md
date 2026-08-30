# 📄 DocuMind AI

> An advanced, AI-powered intelligent document processing platform that transforms unstructured documents into structured, actionable information, enabling seamless chat, visual editing, and analytics.

---

## 🌐 Live Application & Demo

- 🔗 **Frontend (Vercel):** https://docu-mind-ai-orpin.vercel.app
- 🎥 **Demo Video:** *(Add link here)*

---

## 📌 Problem Statement

Organizations and individuals work with a large volume of unstructured documents such as invoices, receipts, purchase orders, contracts, and reports. Processing these manually is slow, repetitive, and error-prone. Modifying, summarizing, or restructuring existing documents often requires tedious manual work or the use of multiple disparate software tools. There is a critical need for a streamlined, single-platform solution where users can upload a document and simply ask an AI to apply changes, extract metadata, or answer contextual questions using natural language.

---

## 🚀 Solution

**DocuMind AI** is a full-stack, AI-powered document intelligence application that solves this problem by providing an integrated pipeline linking secure document storage (Supabase) with advanced generative AI (Google Gemini). 

Users can upload their PDF or Image documents and the platform automatically handles the extraction of structured data, line items, and insights. Beyond standard extraction, DocuMind AI introduces an interactive **"Ask AI" Chat** and a revolutionary **Visual PDF Editor**, making document manipulation completely effortless through natural language prompts.

---

## ✨ Core Features

- **Upload & Storage**: Securely upload and store PDF, PNG, and JPG documents (up to 10MB) via drag-and-drop.
- **Dynamic AI Extraction**: Automatically classify document types and extract context-aware structured fields and line items using Gemini Flash.
- **Interactive "Ask AI" Chat**: A persistent, floating chat assistant that allows users to ask highly specific questions about their uploaded document.
- **Visual PDF Editor**: Manipulate PDFs visually using natural language (e.g., "Redact the signature", "Erase the top right logo").
- **Dashboard Analytics**: View processing statistics and visualize 7-day trailing data with responsive Recharts graphs.
- **Document Management**: View, rename, download, and manage both original and transformed documents from a central, filterable dashboard.
- **Profile Management**: Integrated `react-filerobot-image-editor` for rich profile picture cropping, filtering, and uploading.
- **User Accounts & Security**: Secure JWT authentication and database isolation using Supabase Row Level Security (RLS).
- **Responsive Design**: Carefully crafted, dynamic UI layout fully optimized for mobile phones, tablets, and folding screens.

---

## 🏗️ System Architecture

The application workflow follows a modular full-stack architecture:

1. **Frontend (React/Vite)**: Provides the dynamic user interface, dashboards, and side-by-side document previews. Communicates with the backend via secure REST APIs.
2. **Backend (Node.js/Express)**: Handles business logic, robust error handling, multipart file routing, and acts as the secure intermediary for AI operations.
3. **Database & Storage (Supabase)**: Manages file storage buckets and structured relational data (`users`, `documents`, `document_results`, `chat_messages`).
4. **AI Engine (Google Gemini API)**: Receives document buffers and user prompts to execute complex extraction, visual transformations, and chat contextualization securely on the server side.

---

## 💻 Technology Stack

**Frontend:**
- ⚛️ React & React Router DOM
- ⚡ Vite
- 🌊 Tailwind CSS & PostCSS
- 📊 Recharts
- 🖼️ React Filerobot Image Editor
- 🪄 Lucide React (Icons)

**Backend:**
- 🟢 Node.js
- 🚂 Express.js & CORS
- 📄 PDF-Lib (PDF Manipulations)
- 🗂️ Multer (File Handling)
- 🔐 Bcrypt & JSONWebToken (Auth)
- ✅ Zod (Schema Validation)

**Database & Auth:**
- 🟩 Supabase (PostgreSQL, Storage buckets)
- 🔐 Row Level Security (RLS)

**AI Integration:**
- 🤖 `@google/genai` (Google Gemini 3.5 Flash)

---

## 📦 Local Setup

### Prerequisites
- Node.js (v18+)
- npm
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/jaswanthbuddepu123-hub/DocuMind-AI.git
   cd DocuMind-AI
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The backend will run on `http://localhost:3000`*

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`*

---

## 🔒 Environment Variables

⚠️ **Security Note:** Never commit real API keys, passwords, tokens, or private credentials to GitHub.

**Backend (`backend/.env`)**
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:3000
```

---

## 👨‍💻 Author

**Buddepu Venkata Jaswanth**  
GitHub: [jaswanthbuddepu123-hub](https://github.com/jaswanthbuddepu123-hub)

---
*Built with modern web technologies for the 2026 AI Hackathon.*
