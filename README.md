# CleariFy — GST Compliance Platform

A full-stack GST compliance platform built with FastAPI + React + MySQL.

## 🚀 Features
- ✅ JWT Authentication (Seller/Buyer login)
- ✅ GSTIN Validation
- ✅ Invoice Generation with Auto Tax Calculation
- ✅ WhatsApp Invoice Sharing
- ✅ IMS Dashboard (Accept/Reject/Pending)
- ✅ GSTR-1 Sales Return
- ✅ GSTR-3B Monthly Filing
- ✅ 3-Step Business Registration
- ✅ Audit Trail

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Material UI |
| Backend | Python FastAPI |
| Database | MySQL 8.0 |
| Auth | JWT Tokens |
| Hosting | Railway + Vercel |

## ⚙️ Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔑 Test Credentials
| Role | GSTIN | Password |
|------|-------|----------|
| Seller | 27AAPFU0939F1ZV | test123 |
| Buyer | 29AABCT1332L1ZT | test123 |

## 📁 Project Structure
```
clearify/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── routers/
│       ├── auth.py
│       ├── invoices.py
│       ├── ims.py
│       └── gstin.py
└── frontend/
    └── src/
        ├── pages/
        └── components/
```
```

Then scroll down and click **"Commit new file"** ✅

---

## Next Steps — Deploy Online 🌐

Now your code is on GitHub, you can deploy on Railway!

### STEP 1 — Go to Railway
```
https://railway.app
```

### STEP 2 — Login with GitHub
Click **"Login with GitHub"** → Allow access ✅

### STEP 3 — New Project
1. Click **New Project**
2. Click **Deploy from GitHub repo**
3. Select **clearify** repository ✅

---

## Your Progress So Far
```
✅ Phase 1 — Backend Built (FastAPI)
✅ Phase 2 — Frontend Built (React)
✅ Phase 3 — WhatsApp Feature
✅ Phase 4 — IMS Dashboard
✅ Phase 5 — GSTR Filing
✅ Phase 6 — Registration Page
✅ Phase 7 — Code on GitHub ← YOU ARE HERE

⏳ Phase 8 — Deploy on Railway (Next!)
⏳ Phase 9 — Live URL ready
```

---

## Your GitHub Link

Share your project with anyone:
```
https://github.com/abinaya12906/clearify
