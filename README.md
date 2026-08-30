# 📄 DocuMind AI

> An AI-powered intelligent document processing platform that transforms unstructured documents into structured, actionable information.

## 🌐 Live Application

🔗 **Frontend:** https://docu-mind-ai-orpin.vercel.app

🎥 **Demo Video:**

---

## 📌 Problem Statement

Organizations and individuals work with a large number of documents such as invoices, receipts, purchase orders, contracts, and reports. Processing these documents manually is slow, repetitive, and error-prone. Modifying, summarizing, or restructuring existing documents often requires tedious manual work or the use of multiple disparate software tools. There is a need for a streamlined, single-platform solution where users can upload a document and simply ask an AI to apply changes or generate a new version based on their specific, natural-language instructions.

## 🚀 Solution

**DocuMind AI** is a full-stack AI-powered document transformation application that solves this problem by providing an integrated pipeline that links document storage (Supabase) with advanced generative AI (Google Gemini). Users can upload their PDF documents, type a simple command like "Summarize this document," and the platform automatically handles the extraction, AI processing, and generation of a new transformed document, making document manipulation effortless.

## ✨ Core Features

- **Upload & Storage**: Securely upload and store PDF documents.
- **AI Document Transformation**: Generate a new document based on the uploaded document and a user's instruction.
- **Natural Language Instructions**: Users can provide transformation instructions in plain English.
- **Document Management**: View, download, and manage both original and transformed documents from a central dashboard.
- **Side-by-Side Preview**: Compare the original document with the newly transformed AI document directly in the browser.
- **User Accounts & Security**: Secure user authentication and database isolation using Supabase Row Level Security (RLS).
- **AI-Powered Insights**: Get useful insights and validate document information automatically.
- **Mobile Responsive**: Carefully designed layout matching mobile phones, tablets, and folding screens.

## 🏗️ System Architecture

The application workflow follows a modular full-stack architecture:

1. **Frontend (React/Vite)**: Provides the user interface, dashboards, and side-by-side document previews. Communicates with the backend via REST API.
2. **Backend (Node.js/Express)**: Handles business logic, file routing, and acts as the secure intermediary for AI operations.
3. **Database & Storage (Supabase)**: Manages secure user authentication, file storage (buckets), and structured relational data for document metadata.
4. **AI Engine (Google Gemini AI)**: Receives the document buffers and user prompts to execute the transformation operations.

## 💻 Technology Stack

**Frontend:**
- ⚛️ React
- ⚡ Vite
- 🌊 Tailwind CSS
- 🟨 JavaScript

**Backend:**
- 🟢 Node.js
- 🚂 Express.js
- 🟨 JavaScript

**Database & Auth:**
- 🟩 Supabase (PostgreSQL, Storage, Auth)
- 🔐 Row Level Security (RLS)

**AI Integration:**
- 🤖 Google Gemini AI (gemini-3.5-flash)

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

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🔒 Environment Variables

⚠️ **Never commit real API keys, passwords, tokens, or private credentials to GitHub.**

**Backend (`backend/.env`)**
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:3000
```

---
**Author**: Buddepu Venkata Jaswanth  
**GitHub**: [jaswanthbuddepu123-hub](https://github.com/jaswanthbuddepu123-hub)
