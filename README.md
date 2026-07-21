<h1 align="center">
  ✨ MEGHA-AI ✨
</h1>

<p align="center">
  <b>Your Ultimate AI Companion for Productivity, Learning, Creativity & Automation</b>
</p>

<p align="center">
  MEGHA-AI is a next-generation intelligent platform that combines conversational AI, real-time coding sandboxes, voice interaction, document intelligence, desktop automation, productivity tools, and long-term AI memory into one seamless and dynamic web experience.
</p>

<p align="center">
  <a href="https://megha-ai.vercel.app"><b>🌐 Live Demo</b></a> •
  <a href="#-tech-stack"><b>🛠 Tech Stack</b></a> •
  <a href="#-core-features"><b>⚡ Core Features</b></a> •
  <a href="#-installation--setup"><b>🚀 Installation</b></a>
</p>

---

## 📖 About The Project

MEGHA-AI was built with the vision of creating an all-in-one personalized assistant that goes beyond simple chat. It remembers your preferences, executes code for you, analyzes your documents, helps you prepare for interviews, and automates your workflows. It leverages cutting-edge LLMs (via Groq and OpenRouter), alongside local execution environments to provide unprecedented speed and utility.

---

## ⚡ Core Features

MEGHA-AI is packed with an ecosystem of powerful engines designed to boost your daily productivity:

### 🤖 Intelligent AI Chat & Memory
- **Context-Aware Conversations:** Chat with a highly intelligent AI that understands context.
- **Long-Term Memory Vault:** The AI remembers past conversations, preferences, and personal details to provide a truly personalized experience.
- **Persona Customization:** Tailor the AI's personality, tone, and behavior to your exact liking.

### 💻 Developer & Code Tools (Code Engine)
- **Universal Code Sandbox:** Write, compile, and execute code instantly in Java, Python, C++, Node.js, C, and Go directly from the chat interface.
- **Auto-Debugging:** Let the AI analyze your code, find bugs, and suggest optimal fixes.
- **Project Builder:** Generate full project structures and boilerplate code instantly.

### 📄 Document Intelligence (PDF & DOC AI)
- **Chat with Documents:** Upload PDFs, DOCs, or text files and ask questions directly about their content.
- **Resume Analyzer:** Upload your resume to get ATS scores, actionable feedback, and formatting suggestions.
- **Document Generator:** Automatically generate official drafts, emails, and reports.

### 🎤 Voice & Desktop Integration
- **Voice Assistant:** Communicate with MEGHA-AI completely hands-free using advanced Speech-to-Text and Text-to-Speech capabilities.
- **Desktop Automation:** Trigger local PC automations, file management, and terminal commands via natural language (when running the local desktop client).

### 🎓 Learning & Career Hub
- **Mock Interviews:** Practice technical and HR interviews with real-time AI feedback.
- **AI Tutor:** Learn new concepts, languages, and frameworks with an interactive AI mentor.
- **Salary Engine & Career Hub:** Explore career paths, estimate salaries, and build cover letters.

---

## 🛠 Tech Stack

MEGHA-AI is built using a modern, scalable, and highly performant full-stack architecture.

### Frontend
- **React 19 & Vite:** Blazing fast UI rendering and development experience.
- **Tailwind CSS:** For beautiful, responsive, and dynamic glassmorphism UI designs.
- **Framer Motion:** Smooth micro-animations and page transitions.
- **Redux & React Router:** State management and seamless routing.

### Backend
- **Node.js 22 & Express:** Robust, asynchronous backend infrastructure.
- **Socket.io:** Real-time, bi-directional communication for chat and terminal output.
- **Axios & External APIs:** For interacting with external cloud compilers and LLM providers.

### AI & LLMs
- **Groq:** Ultra-low latency inference for instant AI responses.
- **OpenRouter & Ollama:** Multi-model support including local and cloud-based models.

### Database & DevOps
- **MongoDB 8:** Scalable NoSQL database for users, memory, and chat history.
- **Redis:** High-performance caching mechanism.
- **Docker & Docker Compose:** Containerized environments for secure code execution and easy deployment.
- **PM2 & Nginx:** Production process management and reverse proxy routing.

---

## 🚀 Installation & Setup

Want to run MEGHA-AI locally? Follow these steps!

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/janaganihareesh-star/MEGHA-AI.git
cd MEGHA-AI
```

### 2. Install Dependencies
Install dependencies for both the frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in the **backend** directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key
# Add other necessary API keys here
```

Create a `.env` file in the **frontend** directory:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Run the Application
Start the development servers:
```bash
# In the backend directory
npm run dev

# In a new terminal, in the frontend directory
npm run dev
```

Alternatively, you can run the entire stack using Docker:
```bash
docker-compose up --build
```

---

## 🗺 Roadmap

- [x] AI Chat & Long-Term Memory
- [x] Voice Assistant & Desktop Automation
- [x] Resume Analyzer & PDF AI
- [x] Multi-Language Universal Code Sandbox
- [ ] AI Marketplace & Plugin Store
- [ ] Browser Extension
- [ ] Mobile App (React Native)
- [ ] Multi-Agent Collaboration System

---

## 👨‍💻 Developer

**Hareesh Janagani**  
*AI Developer • MERN Stack Developer • Java Developer*

- **GitHub:** [@janaganihareesh-star](https://github.com/janaganihareesh-star)
- **LinkedIn:** [Hareesh Janagani](https://linkedin.com/in/janagani-hareesh-734947318)

---

<p align="center">
  <b>Always Close. Always Ready.</b><br>
  ⭐ If you found this project helpful or inspiring, please consider giving it a Star!
</p>
