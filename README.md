# 🛡 BGV Platform — Background Verification System

A **production-grade, full-stack Background Verification Platform** that allows organizations to register candidates, run Aadhaar & PAN verification, view verification logs, and download professional PDF reports — all within a modern, secure enterprise dashboard.

---

## ✨ Features

| Module | Features |
|---|---|
| **Auth** | Register, Login, JWT, bcrypt hashing, protected routes, persistent state |
| **Dashboard** | Stats cards, verification progress bar, recent candidates table |
| **Candidates** | Create, edit, delete, search, filter by status, pagination |
| **Verification** | Aadhaar + PAN mock verification, status tracking (VERIFIED / FAILED / PARTIAL / PENDING) |
| **Reports** | Puppeteer-generated PDF with candidate info, verification results, digital signature placeholder |
| **Security** | Helmet, rate limiting, JWT expiry, Aadhaar masking, input validation, CORS |

---

## 🧱 Tech Stack

### Backend
- **Node.js + Express.js** — REST API server
- **MongoDB + Mongoose** — Database with indexing
- **JWT + bcryptjs** — Authentication & password hashing
- **Helmet + express-rate-limit** — Security headers & rate limiting
- **Puppeteer** — PDF report generation
- **express-validator** — Input validation
- **Morgan** — HTTP request logging

### Frontend
- **React 18 + Vite** — Fast development & build
- **Tailwind CSS** — Utility-first styling
- **React Router DOM v6** — Client-side routing
- **Zustand** — Global auth state (persisted)
- **Axios** — HTTP client with JWT interceptors
- **React Hook Form** — Performant form handling
- **React Hot Toast** — Toast notifications
- **date-fns** — Date formatting

### Deployment
- **Frontend** → Vercel
- **Backend** → Render
- **Database** → MongoDB Atlas

---

## 📁 Folder Structure

```
bgv-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, JWT helpers
│   │   ├── controllers/     # auth, candidate, verification, report
│   │   ├── middleware/       # auth guard, error handler, validator
│   │   ├── models/          # User, Candidate, VerificationLog
│   │   ├── routes/          # auth, candidates, verifications, reports
│   │   ├── services/        # verification.service, report.service
│   │   ├── validations/     # express-validator chains
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Entry point
│   ├── .env.example
│   ├── package.json
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/      # Sidebar, Topbar
    │   │   ├── ui/          # StatusBadge, StatCard, Spinner, EmptyState, ConfirmModal
    │   │   ├── candidates/  # CandidateForm
    │   │   └── verification/ # VerificationTimeline
    │   ├── layouts/         # AppLayout (sidebar + topbar + outlet)
    │   ├── pages/           # Login, Register, Dashboard, CandidateList, Detail, Create, Edit
    │   ├── routes/          # ProtectedRoute
    │   ├── services/        # api.js (Axios + interceptors)
    │   ├── store/           # authStore (Zustand)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── vercel.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/bgv-platform.git
cd bgv-platform
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/bgv_platform
JWT_SECRET=your_super_secret_min_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Candidates
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/candidates` | List (search, filter, paginate) |
| POST | `/api/candidates` | Create candidate |
| GET | `/api/candidates/stats` | Dashboard stats |
| GET | `/api/candidates/:id` | Get with logs |
| PUT | `/api/candidates/:id` | Update (PENDING only) |
| DELETE | `/api/candidates/:id` | Delete + cascade logs |

### Verifications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/verifications/:id/start` | Run Aadhaar + PAN checks |
| GET | `/api/verifications/:id/logs` | Get verification history |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/:id` | Download PDF report |

### Mock APIs (Internal)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/mock-api/aadhaar/verify` | Simulate Aadhaar check |
| POST | `/mock-api/pan/verify` | Simulate PAN check |

---

## 🔐 Security Features

- **JWT authentication** with 7-day expiry
- **bcrypt** password hashing (12 salt rounds)
- **Helmet** — sets 15+ HTTP security headers
- **Rate limiting** — 200 req/15min (API), 20 req/15min (auth)
- **Aadhaar masking** — stored & displayed as `XXXX-XXXX-1234`
- **Input validation** on every endpoint (express-validator)
- **CORS** restricted to frontend origin
- **Error messages** never leak stack traces in production

---

## 🧪 Testing the API

Import `BGV_Platform.postman_collection.json` into Postman.

**Quick flow:**
1. Run **Register** → creates account
2. Run **Login** → token auto-saved to collection variable
3. Run **Create Candidate** → `candidateId` auto-saved
4. Run **Start Verification** → runs mock Aadhaar + PAN
5. Run **Download PDF Report** → saves PDF locally

---

## 🌐 Deployment

### Deploy Backend to Render

1. Push `backend/` to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo, set root to `backend/`
4. Build: `npm install` | Start: `npm start`
5. Add environment variables from `.env.example`

### Deploy Frontend to Vercel

1. Push `frontend/` to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repo, framework: **Vite**
4. Add env var: `VITE_API_BASE_URL=https://your-render-url.onrender.com/api`
5. Deploy

### MongoDB Atlas Setup

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user + allow network access (0.0.0.0/0 for Render)
3. Copy connection string to `MONGODB_URI`

---

## 📊 Sample API Responses

### POST /api/auth/login
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "name": "Admin User",
      "email": "admin@bgv.com",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### POST /api/verifications/:id/start
```json
{
  "success": true,
  "message": "Verification complete. Status: VERIFIED",
  "data": {
    "overallStatus": "VERIFIED",
    "aadhaar": {
      "status": "verified",
      "result": {
        "status": "verified",
        "nameMatch": true,
        "dobMatch": true,
        "message": "Aadhaar verified successfully",
        "referenceId": "AADHAAR-1705312200000"
      }
    },
    "pan": {
      "status": "verified",
      "result": {
        "status": "verified",
        "panStatus": "active",
        "message": "PAN verified successfully",
        "referenceId": "PAN-1705312200600"
      }
    }
  }
}
```

---

## 🗺 Development Roadmap

- [ ] Bulk CSV candidate upload
- [ ] Email notifications (Nodemailer / SendGrid)
- [ ] Role-based access control (Admin / Verifier / Viewer)
- [ ] Audit logs for all admin actions
- [ ] Real Aadhaar/PAN API integration (Sandbox APIs)
- [ ] Redis caching for repeated verifications
- [ ] WebSocket real-time status updates
- [ ] Face match verification
- [ ] Multi-tenant architecture

---

## 📸 Screenshots

> After deploying, add screenshots here.

- `Login page`
- `Dashboard with stats`
- `Candidate list with filters`
- `Candidate detail + verification timeline`
- `PDF report sample`

---

## 👤 Author

Built as a production-grade full-stack project demonstrating enterprise architecture, security best practices, and modern React/Node.js patterns.

---

## 📄 License

MIT — free to use for personal and commercial projects.
