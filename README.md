# ⚡ AI ContractKit

AI ContractKit is an AI-native workspace that automates the document-heavy side of freelance and agency work — drafting contracts and proposals, negotiating them with clients, and tracking invoices — so you spend less time on paperwork and more on the work itself.

It replaces static PDFs and long email threads with collaborative, AI-assisted tools.

> ⚠️ **Not legal advice.** AI ContractKit generates draft documents using a large language model. They are starting points, not a substitute for review by a qualified lawyer in your jurisdiction.

## 🚀 Headline features

AI ContractKit goes beyond plain document generation. It uses Groq's hosted LLaMA 3.3 (70B) for fast inference to actively help you negotiate and protect your time:

* 🛡️ **Scope Creep Defender** — Paste a client's "one more quick thing" request. The AI cross-references it against the signed contract, flags whether it's out of scope, and drafts a response email in your chosen **tone** (professional / firm / friendly / upsell). It returns a **confidence score**, **locates and highlights the exact governing clause inside the contract** (and flags hallucinated citations it can't verify), and lets you **log the value of caught work into a running "revenue protected" total**. Its accuracy is measured by a labeled **evaluation harness** (`npm run eval:scope`), not assumed — **97.8% accuracy / 0.98 F1 on 45 labeled cases** (see [Testing & evaluation](#-testing--evaluation)).
* 🎙️ **Notes-to-Contract** — Paste messy discovery-call notes or a rough transcript. The AI extracts deliverables, timelines, and pricing and turns them into a formal, structured contract.
* 🤝 **AI-assisted redlining** — Share a public link. Clients highlight any clause and leave a comment (e.g. *"Make payment terms Net-30"*). From your dashboard, **✨ AI Resolve** rewrites that clause and patches it into the document — with full version history and one-click revert.
* 🧠 **Plain-English mode (ELI5)** — Clients can toggle a simplified, jargon-free view of the contract so they understand what they're signing before they sign.
* ⚠️ **Risk highlighting** — Before you send, the AI flags risky or missing clauses (e.g. uncapped liability, no late-payment penalty) and highlights them inline by severity.

## 🛠️ Core capabilities

* **Proposal generation** — Draft persuasive, structured project proposals from a short brief.
* **Tamper-evidence signing** — Clients sign in-browser. Each signature is stored with a timestamp, IP address, user agent, and a **SHA-256 hash of the exact contract content**, so any later change to the document is detectable. *(This is a tamper-evidence record, not a certified e-signature under ESIGN/eIDAS — see Roadmap.)*
* **Invoicing** — Create itemized invoices with auto-calculated totals and sequential numbering. *(Online payment collection is on the roadmap — see below.)*
* **Client CRM** — Track clients and keep their documents organized.
* **Contract similarity library** — As you generate, contracts are indexed by category into a persistent (MongoDB-backed) store and ranked with **TF-IDF weighted cosine similarity**, so new drafts can reuse clause patterns from your past contracts of the same type. The library survives restarts and cold starts.

## 💻 Technology stack

* **Frontend:** React 19 (Vite), React Router, TanStack Query, Tailwind CSS, Recharts, Lucide icons.
* **Backend:** Node.js, Express.
* **Database:** MongoDB & Mongoose.
* **AI engine:** Groq API (LLaMA 3.3 70B) for low-latency inference, with token streaming over SSE.
* **Email (optional):** Nodemailer — client delivery and signature/comment alerts. Silently no-ops if SMTP isn't configured.

## 🔒 Security notes

* Passwords are hashed with bcrypt; auth is via JWT.
* Every authenticated query is scoped to the owning user, and client-facing public views strip private data (risk analysis, AI prompts, edit history).
* All LLM- and client-generated HTML is sanitized with DOMPurify before rendering.
* Rate limiting is applied globally, with tighter limits on auth (brute-force) and on the paid AI-generation endpoints (cost control).
* **Known trade-off:** the JWT is stored in `localStorage` for simplicity. Moving it to an httpOnly cookie is on the roadmap.

## 🧪 Testing & evaluation

* **Unit tests** — `cd backend && npm test` runs the Node built-in test runner across the pure logic: TF-IDF similarity, contract category detection, AI-output parsing, and the Scope Creep Defender's clause verification + confidence normalization.
* **AI evaluation harness** — `npm run eval:scope` runs the Scope Creep Defender against a labeled dataset of **45 cases** (`backend/eval/scope-dataset.json`, spanning web, mobile, design, content, and consulting contracts, balanced across in-scope / out-of-scope / borderline requests) and reports **accuracy, precision, recall, F1**, plus how often the cited clause was verifiable and the mean confidence. This is how the classifier's quality is measured rather than assumed. *(Requires `GROQ_API_KEY`.)*

  **Latest run** (`llama-3.3-70b-versatile`, 45 cases, 44 correct):

  | Metric | Score |
  |---|---|
  | Accuracy | **97.8%** |
  | Precision | **1.00** |
  | Recall | **0.96** |
  | F1 | **0.98** |
  | Clause-citation verified | 98% of cases |
  | Mean confidence | 0.93 |

  The single miss is a deliberately borderline case (a request explicitly covered by a *rush-surcharge* clause — arguably "in scope but billable"), which is exactly the kind of judgment call kept in the set so the score isn't gamed. Results vary slightly run-to-run (sampling temperature 0.2).
* **CI** — GitHub Actions runs the backend tests and the frontend build/lint on every push and PR (`.github/workflows/ci.yml`).

## 🗺️ Roadmap

* Online payments (e.g. Razorpay / Stripe) wired to the existing invoice model.
* Semantic-embedding similarity as an optional upgrade to the current TF-IDF ranking.
* Certified e-signature flow with a downloadable, independently verifiable audit certificate.
* httpOnly-cookie auth to replace `localStorage` token storage.

## ⚙️ Run locally

### Prerequisites
* Node.js (v18+)
* MongoDB (local or an Atlas URI)
* A [Groq API key](https://console.groq.com/)

### Backend
```bash
cd backend
npm install
```
Create `backend/.env` (see `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/contractkit
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=gsk_your_groq_api_key
# Optional email notifications — see .env.example for the full list
```
Start it:
```bash
npm run dev
```

### Frontend
```bash
cd ../frontend
npm install
```
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start it:
```bash
npm run dev
```

Open `http://localhost:5173` and register an account to get started.

---
*Built for freelancers who'd rather focus on their craft than their paperwork.*
