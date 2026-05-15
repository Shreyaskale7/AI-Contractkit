# ⚡ AI ContractKit

> **AI-powered freelancer business operating system** — Generate professional contracts, manage clients, create invoices, and get AI-powered risk analysis. All in one place.

![AI ContractKit](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen) ![AI](https://img.shields.io/badge/AI-Groq%20LLaMA-purple)

## 🌐 Live Demo

**[https://ai-contractkit.vercel.app](https://ai-contractkit.vercel.app)**

---

## ✨ What Makes This Special

Most freelancers juggle 4–5 different tools for contracts, invoices, and client management. **AI ContractKit replaces all of them.**

Type one sentence like:
> *"Create a freelance app development contract for ₹75,000 with 3 milestones and 2 revisions"*

And get back a **complete, legally-sound contract** in under 2 seconds — with automatic risk analysis.

---

## 🚀 Features

### 🤖 AI-Powered
- **AI Contract Generator** — Describe your project in plain English → get a full professional contract
- **AI Risk Detector** — Automatically scans every contract for missing or risky clauses
- **Dual AI Pipeline** — Chained LLM calls: generate → analyze → flag risks

### 📄 Contract Management
- Create, edit, and manage freelance contracts
- Public shareable link for clients (no login required)
- Contract status tracking (Draft → Sent → Signed)
- PDF export with one click

### 🧾 Invoice System
- Professional invoice generator with line items
- Auto-generated invoice numbers (INV-001, INV-002...)
- Payment status tracking (Unpaid → Paid → Overdue)
- Multi-currency support (INR, USD)

### 👥 Client Management
- Full client database with CRUD operations
- Client profiles with contact details
- Active/Inactive status tracking

### 🔐 Authentication
- Secure JWT-based authentication
- bcrypt password hashing
- Protected routes with middleware

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| React Hot Toast | Notifications |
| Tailwind CSS v4 | Styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-async-errors | Error handling |

### AI & Services
| Technology | Purpose |
|---|---|
| Groq API (LLaMA 3.3 70B) | Contract generation & risk analysis |
| MongoDB Atlas | Cloud database |
| Vercel | Frontend hosting |
| Render.com | Backend hosting |

---

## 📁 Project Structure

```
AI-Contractkit/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── groq.js            # Groq AI client
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile
│   │   ├── clientController.js
│   │   ├── contractController.js  # AI generation + CRUD
│   │   └── invoiceController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Contract.js
│   │   └── Invoice.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── contractRoutes.js
│   │   └── invoiceRoutes.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Contracts.jsx
│   │   │   ├── GenerateContract.jsx
│   │   │   └── Invoices.jsx
│   │   ├── services/
│   │   │   └── api.js         # All API calls
│   │   └── App.jsx
│   └── vite.config.js
└── README.md
```

---

## ⚙️ API Endpoints

### Authentication
```
POST   /api/auth/register     # Create account
POST   /api/auth/login        # Login
GET    /api/auth/me           # Get profile (protected)
```

### Clients
```
GET    /api/clients           # Get all clients
POST   /api/clients           # Create client
PUT    /api/clients/:id       # Update client
DELETE /api/clients/:id       # Delete client
```

### Contracts
```
POST   /api/contracts/generate        # AI generate contract
GET    /api/contracts                 # Get all contracts
GET    /api/contracts/:id             # Get single contract
GET    /api/contracts/public/:token   # Public view (no auth)
DELETE /api/contracts/:id             # Delete contract
```

### Invoices
```
GET    /api/invoices              # Get all invoices
POST   /api/invoices              # Create invoice
PUT    /api/invoices/:id/status   # Update payment status
DELETE /api/invoices/:id          # Delete invoice
```

---

## 🏃 Run Locally

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd backend
npm install

# Create .env file
PORT=5000
MONGO_URI=mongodb://localhost:27017/aicontractkit
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key

npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
VITE_API_URL=http://localhost:5000/api

npm run dev
```

Open **http://localhost:5173**

---

## 🚀 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://ai-contractkit.vercel.app |
| Backend | Render.com | https://ai-contractkit.onrender.com |
| Database | MongoDB Atlas | Cloud (Mumbai region) |

---

## 🧠 Key Technical Decisions

### Why Groq over OpenAI?
Groq's LLaMA 3.3 70B is free, faster, and produces excellent structured output for legal documents. No credit card required for development.

### Why JWT over Sessions?
Stateless authentication scales better and works seamlessly across separate frontend/backend deployments on different domains.

### Why MongoDB over SQL?
Contract content is HTML strings of variable length. Document databases handle this more naturally than relational tables.

### Dual AI Call Architecture
```
User Prompt
    ↓
AI Call #1 → Full Contract HTML (2000 tokens)
    ↓
AI Call #2 → Risk Analysis JSON (300 tokens)
    ↓
Parse + Save to MongoDB
    ↓
Return contract + riskFlags[]
```

---

## 📈 Roadmap

- [ ] Canvas e-signature with audit trail
- [ ] Analytics dashboard with Recharts
- [ ] AI proposal generator
- [ ] Email notifications (Nodemailer)
- [ ] Contract templates library
- [ ] Public client portal
- [ ] Dark mode
- [ ] PWA (installable on mobile)

---

## 👨‍💻 Built By

**Shreyas Kale**
- GitHub: [@Shreyaskale7](https://github.com/Shreyaskale7)

---

## 📄 License

MIT License — free to use and modify.

---

<div align="center">
  <strong>⭐ Star this repo if you found it useful!</strong>
</div>

