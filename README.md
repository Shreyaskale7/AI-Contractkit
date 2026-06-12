# ⚡ AI ContractKit

AI ContractKit is an exceptional, AI-native SaaS platform built to automate and supercharge the entire client onboarding, legal, and billing lifecycle for freelancers and digital agencies. 

It replaces static PDF documents and endless email threads with intelligent, collaborative, and highly professional tools that make you look like an enterprise-level business.

## 🚀 The "Wow" Features

AI ContractKit isn't just a document generator. It leverages advanced Large Language Models (Groq's LLaMA 3) to actively defend your time and close deals faster:

*   🛡️ **Scope Creep Defender:** A client asks for "one more quick thing" via email. Paste their request into the Defender. The AI instantly cross-references it with your signed contract, proves it is out-of-scope, and drafts a polite, professional pushback email (or an upsell offer).
*   🎙️ **Voice-to-Contract:** Don't waste time typing scopes. Paste your messy Zoom transcript or rough bullet points from a discovery call, and the AI will extract deliverables, timelines, and pricing to generate a formal, ready-to-sign contract instantly.
*   🤝 **AI-Powered Redlining & Negotiation:** Send a public link to your client. Instead of emailing back and forth, they can highlight any text in the contract and leave a comment (e.g., *"Make payment terms Net-30"*). In your dashboard, you just click **"✨ AI Resolve"**, and the AI instantly rewrites the legal clause to satisfy the request and patches it into the document.
*   🧠 **"Explain Like I'm 5" (ELI5) Legal Translation:** Clients often hesitate to sign because they don't understand the legal jargon. With the flip of a switch, clients can view the contract in "Plain English Mode," translating dense legal text into simple, everyday language.
*   ⚠️ **Dynamic Risk Heatmap:** Before you send a contract, the AI analyzes it and generates a visual heatmap, flagging High (Red), Medium (Yellow), and Low (Blue) risk clauses (e.g., uncapped liabilities or infinite revisions) so you know exactly what you are agreeing to.

## 🛠️ Core Capabilities

Beyond the exceptional AI tools, the platform provides a complete operating system for your freelance business:

*   **Proposal Generation:** Instantly draft highly persuasive, customized project proposals based on a simple brief.
*   **Cryptographic E-Signatures:** Legally binding digital signatures complete with audit trails (IP address, browser data, and SHA-256 content hashes).
*   **Integrated Invoicing & Payments:** Send beautiful digital invoices with integrated **Razorpay** payment gateways. Clients can pay you instantly via UPI, Cards, or Net Banking without you lifting a finger.
*   **Client CRM:** Manage your roster of clients, track their status, and keep all their documents organized in one place.
*   **RAG (Retrieval-Augmented Generation):** The system indexes your past successful contracts, learning your style and preferred clauses over time to generate better documents.

## 💻 Technology Stack

*   **Frontend:** React (Vite), React Router, Lucide Icons, Vanilla CSS (Custom sleek, modern SaaS design system).
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB & Mongoose.
*   **AI Engine:** Groq API (LLaMA 3 70b) for lightning-fast inference.
*   **Payments:** Razorpay API for native Indian payment processing.
*   **Security:** JSON Web Tokens (JWT), Bcrypt password hashing, Crypto for document hashing.

## ⚙️ How to Run Locally

### Prerequisites
*   Node.js (v18+)
*   MongoDB running locally or a MongoDB Atlas URI
*   A [Groq API Key](https://console.groq.com/)
*   A [Razorpay Account](https://razorpay.com/) (Test Keys)

### Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd ai-contractkit
   \`\`\`

2. **Setup the Backend:**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`
   Create a `.env` file in the `backend` folder:
   \`\`\`env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/contractkit
   JWT_SECRET=your_super_secret_jwt_key
   GROQ_API_KEY=gsk_your_groq_api_key
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   \`\`\`
   Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Setup the Frontend:**
   \`\`\`bash
   cd ../frontend
   npm install
   \`\`\`
   Create a `.env` file in the `frontend` folder:
   \`\`\`env
   VITE_API_URL=http://localhost:5000/api
   \`\`\`
   Start the frontend development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access the App:**
   Open your browser and navigate to `http://localhost:5173`. Register a new account to get started!

---
*Built with ❤️ for freelancers who want to focus on their craft, not paperwork.*
