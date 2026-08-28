# 📄 DocuMind-AI

> An AI-powered full-stack document processing and intelligent assistant application.

DocuMind-AI is a full-stack web application designed to make document processing and document-based interaction easier and more intelligent.

Users can upload documents, process and extract information from them, interact with an AI assistant, and maintain chat history associated with their documents.

---

## 🚀 Project Overview

DocuMind-AI combines document processing, AI-powered question answering, authentication, database storage, and a modern web interface into a single full-stack application.

The main goal of the project is to allow users to:

- 📤 Upload documents
- 📑 Process PDF documents
- 🤖 Interact with an AI assistant
- 💬 Ask questions related to documents
- 🧠 Generate AI-powered responses
- 🗂️ Manage uploaded documents
- 📜 Maintain chat history
- 🔐 Secure user-specific data
- 🎨 Use a modern and responsive interface

---

## ✨ Key Features

### 📤 Document Upload

Users can upload documents through the application.

The backend receives the uploaded document and processes it before storing the required information.

### 📑 PDF Document Processing

The application supports PDF document processing.

The processing pipeline can:

1. Receive the uploaded document
2. Validate the document
3. Extract document content
4. Process the extracted information
5. Store the required document data
6. Make the processed information available for AI interaction

---

### 🤖 AI-Powered Assistant

DocuMind-AI includes an intelligent AI assistant that allows users to interact with their documents.

Users can ask questions and receive AI-generated responses based on the available document information.

The AI assistant is integrated into the application as a floating assistant interface.

---

### 💬 Chat History

The application maintains chat messages associated with documents.

Each chat message contains information such as:

- User
- Document
- Role
- Message content
- Creation time

The system supports both:

- `user` messages
- `assistant` messages

This allows conversations to be preserved and associated with the corresponding document.

---

### 🗂️ Document Management

Users can view and manage their uploaded documents.

The application provides document-related pages and interfaces for interacting with uploaded files.

---

### 🔐 User-Based Data

The application uses user-specific data relationships.

Documents and chat messages are associated with users so that application data can be organized according to the authenticated user.

---

### 🛡️ Row Level Security

Supabase Row Level Security (RLS) is used for database-level access control.

The `chat_messages` table has RLS enabled so that database access can be controlled according to the application's security rules.

---

### 🎨 Theme Support

The frontend includes theme management through a React context.

The project contains:

- `ThemeContext.jsx`
- Application-wide theme handling
- Responsive UI components

---

## 🏗️ Project Architecture

```text
DocuMind-AI/
│
├── backend/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── chatController.js
│   │   │   └── documentController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── chatRoutes.js
│   │   │   └── documentRoutes.js
│   │   │
│   │   ├── schemas/
│   │   │   ├── chatSchema.js
│   │   │   └── extractionSchema.js
│   │   │
│   │   ├── services/
│   │   │   ├── documents/
│   │   │   │   ├── processingService.js
│   │   │   │   └── pdfTransformService.js
│   │   │   │
│   │   │   └── gemini/
│   │   │       └── geminiService.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── supabase/
│   │   └── migrations/
│   │       ├── 001_init.sql
│   │       ├── 002_add_processing_error.sql
│   │       └── 003_add_chat_history.sql
│   │
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   └── FloatingAIAssistant.jsx
│   │   │
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DocumentDetail.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── Landing.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── services/
│   │   │   └── documentService.js
│   │   │
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── SECURITY_AUDIT.md
└── README.md

🧩 Technology Stack
Frontend
⚛️ React
🟨 JavaScript
🎨 CSS
🌊 Tailwind CSS
⚡ Vite
Backend
🟢 Node.js
🚂 Express.js
🟨 JavaScript
Database / Backend Services
🟩 Supabase
🐘 PostgreSQL
🔐 Row Level Security
AI
🤖 Google Gemini AI
Document Processing
📄 PDF processing
📑 Document extraction
🧠 AI-based document interaction
Development Tools
Git
GitHub
Visual Studio Code / Antigravity IDE
npm
🔄 Application Workflow

The overall application workflow can be represented as:

                ┌───────────────────┐
                │       User        │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ React Frontend    │
                │                   │
                │ Dashboard         │
                │ Documents         │
                │ Document Details  │
                │ AI Assistant      │
                └─────────┬─────────┘
                          │
                          │ API Requests
                          ▼
                ┌───────────────────┐
                │ Express Backend   │
                │                   │
                │ Controllers       │
                │ Routes            │
                │ Services          │
                └──────┬───────┬────┘
                       │       │
             ┌─────────┘       └─────────┐
             ▼                           ▼
    ┌──────────────────┐        ┌──────────────────┐
    │ Document         │        │ Gemini AI        │
    │ Processing       │        │ Service          │
    │                  │        │                  │
    │ PDF Processing   │        │ AI Responses     │
    │ Content Extract  │        │ Q&A              │
    └────────┬─────────┘        └────────┬─────────┘
             │                           │
             └────────────┬──────────────┘
                          ▼
                ┌───────────────────┐
                │     Supabase      │
                │                   │
                │ PostgreSQL        │
                │ Documents         │
                │ Chat Messages     │
                │ RLS               │
                └───────────────────┘
🧠 AI Assistant Workflow

The AI assistant follows a document-based interaction flow:

User
  │
  ▼
Select / Upload Document
  │
  ▼
Document Processing
  │
  ▼
Content Extraction
  │
  ▼
User asks a question
  │
  ▼
Backend Chat API
  │
  ▼
Gemini AI Service
  │
  ▼
AI-generated response
  │
  ▼
Store Chat History
  │
  ▼
Display Response
🗄️ Database

The project uses Supabase/PostgreSQL for persistent data storage.

Database migrations are located inside:

backend/supabase/migrations/

Current migration files include:

001_init.sql
002_add_processing_error.sql
003_add_chat_history.sql
💬 Chat Messages Table

The chat history migration creates a chat_messages table.

Conceptually, the table contains:

Column	Description
id	Unique message ID
document_id	Associated document
user_id	User who owns the message
role	user or assistant
content	Message content
created_at	Message creation time

The document_id references the documents table.

The relationship allows chat conversations to remain connected to their corresponding documents.

🔐 Environment Variables

Environment variables are required for running the application.

Backend .env

Create:

backend/.env

Example:

PORT=5000

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

GEMINI_API_KEY=your_gemini_api_key
Frontend .env

If the frontend requires environment variables, create:

frontend/.env

Example:

VITE_API_URL=http://localhost:5000

⚠️ Never commit real API keys, passwords, tokens, or private credentials to GitHub.

🛠️ Installation
1. Clone the Repository
git clone https://github.com/jaswanthbuddepu123-hub/DocuMind-AI.git

Move into the project:

cd DocuMind-AI
⚙️ Backend Setup

Move into the backend directory:

cd backend

Install dependencies:

npm install

Create your environment file:

.env

Add the required environment variables.

Then start the backend:

npm start

If the project uses a development script:

npm run dev
🎨 Frontend Setup

Open another terminal.

From the project root:

cd frontend

Install dependencies:

npm install

Create the frontend environment file if required:

.env

Then start the frontend:

npm run dev

The frontend will normally be available through the Vite development server.

🔗 Frontend and Backend Communication

The frontend communicates with the backend using HTTP API requests.

Conceptually:

Frontend
   │
   │ HTTP Request
   ▼
Backend API
   │
   ├── Document Routes
   │
   └── Chat Routes
   │
   ▼
Services
   │
   ├── Document Processing
   ├── PDF Transformation
   └── Gemini AI
   │
   ▼
Supabase / AI Services
📡 Backend API Structure

The backend contains dedicated route modules.

Document Routes
backend/src/routes/documentRoutes.js

Responsible for document-related API operations.

Chat Routes
backend/src/routes/chatRoutes.js

Responsible for AI assistant and chat-related API operations.

Controllers
backend/src/controllers/

Controllers contain application logic for handling incoming requests.

🤖 Gemini AI Integration

The Gemini integration is organized inside:

backend/src/services/gemini/geminiService.js

The service is responsible for communicating with the Gemini AI model and generating AI-powered responses.

The general architecture is:

User Question
      │
      ▼
Chat Controller
      │
      ▼
Gemini Service
      │
      ▼
Gemini AI
      │
      ▼
Generated Response
      │
      ▼
Chat Controller
      │
      ▼
Frontend
📄 PDF Processing

PDF-related transformation and processing logic is organized under:

backend/src/services/documents/

Important services include:

processingService.js
pdfTransformService.js

These services form part of the document-processing pipeline.

🛡️ Security

Security-related information is documented in:

SECURITY_AUDIT.md

Important security practices include:

Never expose API keys
Use environment variables for secrets
Protect user-specific data
Use database-level Row Level Security
Validate uploaded files
Validate API input
Avoid committing .env files
Keep sensitive configuration outside source control
📁 Git and GitHub

The project uses Git for version control.

The GitHub repository is:

DocuMind-AI

Repository:

https://github.com/jaswanthbuddepu123-hub/DocuMind-AI
🌿 Git Workflow

Typical development workflow:

git status

Add changes:

git add .

Commit changes:

git commit -m "Describe your changes"

Push changes:

git push
🧪 Testing

The backend contains test files such as:

test_auth.js
test_gemini.js
test_upload.js

These can be used to test different parts of the backend functionality.

Before deployment, test:

Authentication
Document upload
PDF processing
AI responses
Chat history
Database operations
API communication
Frontend/backend integration
🚀 Deployment

The project is structured as a full-stack application with separate:

frontend/
backend/

This allows the frontend and backend to be deployed independently.

Typical deployment architecture:

                 Internet
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
     Frontend Host       Backend Host
          │                   │
          │                   │
          └─────────┬─────────┘
                    │
                    ▼
               Supabase
                    │
                    ▼
               PostgreSQL

The frontend should use the deployed backend URL through its environment configuration.

The backend should contain the required production environment variables.

🌟 Future Enhancements

Possible future improvements include:

🔎 Advanced document search
🧠 Retrieval-Augmented Generation (RAG)
📚 Support for additional document formats
📊 Document analytics
🔐 Improved authentication
👥 Team collaboration
📱 Improved mobile experience
🗣️ Voice-based AI interaction
🌐 Multi-language document support
⚡ Streaming AI responses
📈 Usage analytics
🗂️ Advanced document organization
🔍 Semantic search across multiple documents
🎯 Project Goals

The main goals of DocuMind-AI are:

Simplify document processing.
Provide an intelligent document assistant.
Make document information easier to access.
Combine AI with document management.
Maintain persistent conversation history.
Provide secure user-specific data management.
Build a scalable full-stack architecture.
Provide a clean and user-friendly experience.
📸 Application Modules

The application contains several major frontend modules:

🏠 Landing Page

Introduces the DocuMind-AI platform.

📊 Dashboard

Provides an overview of the user's document-related activity.

📚 Documents

Allows users to view uploaded documents.

📄 Document Details

Provides document-specific information and interaction.

🤖 Floating AI Assistant

Provides quick access to the AI assistant throughout the application.

👤 Profile

Provides user profile-related functionality.

🏆 Project Highlights
Full-Stack Architecture
React
  +
Node.js / Express
  +
Supabase / PostgreSQL
  +
Gemini AI
AI Integration

The application integrates generative AI into a practical document-processing workflow.

Persistent Chat

AI conversations can be stored and associated with documents.

Secure Database

Supabase Row Level Security provides an additional layer of database access control.

Modular Backend

The backend separates:

Routes
Controllers
Schemas
Services
AI integration
Document processing

This makes the application easier to maintain and extend.

👨‍💻 Author

Buddepu Venkata Jaswanth

GitHub:

https://github.com/jaswanthbuddepu123-hub
📜 License

This project can be used for educational, development, and demonstration purposes.

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
