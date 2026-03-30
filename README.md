# 🏛️ GovExam Prep Platform

A production-ready web + mobile application for government exam preparation (MPSC, UPSC, Group B/C/D, All India Services) with AI-powered explanations and advanced proctoring.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Web | React JS + TypeScript + Tailwind CSS + Framer Motion |
| Frontend Mobile | React Native + NativeWind |
| Backend | Python FastAPI (async REST) |
| Database | PostgreSQL 15 + Redis 7 |
| File Storage | Local filesystem (no cloud) |
| Auth | OTP via SMS (Twilio/MSG91) |
| AI | OpenAI GPT-4o |
| Face Detection | face-api.js (client-side) |
| Object Detection | TensorFlow.js COCO-SSD |
| Payments | Razorpay + PhonePe |

---

## 📁 Project Structure

```
govExam/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── redis_client.py
│   │   ├── middleware/
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── routers/          # FastAPI route handlers
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── utils/
│   ├── migrations/
│   │   └── schema.sql        # PostgreSQL DDL
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
├── frontend-web/             # React + TypeScript web app
│   ├── src/
│   │   ├── api/              # Axios API clients
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Route pages
│   │   ├── store/            # Redux Toolkit state
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript types
│   │   └── utils/
│   └── public/locales/       # i18n translations
├── frontend-mobile/          # React Native mobile app
│   └── src/
│       ├── api/
│       ├── components/
│       ├── navigation/
│       ├── screens/
│       └── store/
└── docker-compose.yml
```

---

## 🔑 Default Login Credentials

> **These are for development only. Change before production.**

| Role | Phone | OTP |
|---|---|---|
| Super Admin | 9000000000 | 123456 |
| Institute Admin | 9000000001 | 123456 |
| Student | 9000000002 | 123456 |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your values

# Run database migrations
psql -U your_user -d your_db -f migrations/schema.sql

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 2. Frontend Web Setup

```bash
cd frontend-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

---

### 3. Frontend Mobile Setup

```bash
cd frontend-mobile

# Install dependencies
npm install

# Start Expo development
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

---

### 4. Docker Setup (Recommended)

```bash
# Copy env file
cp backend/.env.example backend/.env
# Edit backend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

Services:
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs (development only)
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## 🌐 API Overview

### Base URL: `/api/v1`

| Module | Endpoints |
|---|---|
| Auth | POST /auth/send-otp, POST /auth/verify-otp, POST /auth/refresh |
| Users | GET/PUT /users/me, POST /users/profile-photo |
| Institutes | CRUD /institutes |
| Questions | CRUD /questions, POST /questions/bulk-upload |
| Assignments | CRUD /assignments |
| Submissions | POST /submissions/start, PUT /submissions/{id}/answer, POST /submissions/{id}/submit |
| Violations | POST /violations/log |
| Payments | POST /payments/create-order, POST /payments/verify |
| GPT | POST /gpt/explain |
| Analytics | GET /analytics/dashboard |

---

## 🔐 Environment Variables

See `backend/.env.example` for the complete list.

Key variables:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/examprep_db
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your-super-secret-key
OPENAI_API_KEY=sk-...
TWILIO_ACCOUNT_SID=AC...
RAZORPAY_KEY_ID=rzp_...
```

---

## 🌍 Multilingual Support

Supported languages:
- **English** (en)
- **Marathi** (mr)  
- **Hindi** (hi)

Translation files located at:
- `frontend-web/public/locales/{lang}/translation.json`
- `frontend-mobile/src/i18n.ts`

---

## 📱 Exam Proctoring Features

1. **Face Verification** – face-api.js compares live webcam with profile photo (≥0.6 similarity)
2. **Continuous Monitoring** – TensorFlow.js COCO-SSD detects violations every 10 seconds
3. **Violation Types**: multiple faces, no face, phone detected, book detected
4. **3 Strikes** – auto-submits exam on 3rd violation
5. **Fullscreen Enforcement** – Fullscreen API
6. **Tab Switch Detection** – Page Visibility API
7. **DevTools Detection** – dimension change monitoring

---

## 🚀 Deployment

### Backend → Render.com
1. Connect GitHub repo
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

### Frontend Web → Vercel
1. Connect GitHub repo, select `frontend-web` as root
2. Set `VITE_API_BASE_URL` environment variable
3. Deploy

### Mobile → Expo EAS
```bash
cd frontend-mobile
npx eas build --platform android
npx eas submit --platform android
```

---

## 📄 License

MIT License — For educational purposes.
