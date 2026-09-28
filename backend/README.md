# MPLAD Anomaly Detection System - Backend API (SIH26102)

Backend service for the **MPLAD Anomaly Detection System (SIH26102)** hackathon prototype. Built using Node.js, Express.js, and ES Modules (`import`/`export`).

## Features
- **Authentication**: Simulated login (`POST /api/auth/login`) and current user check (`GET /api/auth/me`).
- **Dashboard API**: Real-time project aggregate statistics and recent high-risk alerts (`GET /api/dashboard`).
- **Projects API**: Filtered project listings (`GET /api/projects`) and detailed anomaly breakdown (`GET /api/projects/:id`).
- **Alerts API**: Filterable risk alerts categorized by financial mismatch, delay, photo mismatch, or duplicates (`GET /api/alerts`).
- **Reports API**: Regional risk concentration and status metrics (`GET /api/reports`).
- **Settings API**: Admin user preferences and profile updates (`GET /api/settings`, `PUT /api/settings`).

## Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── projectController.js
│   │   ├── alertController.js
│   │   ├── reportController.js
│   │   └── settingsController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── reportRoutes.js
│   │   └── settingsRoutes.js
│   ├── data/
│   │   └── dummyData.js
│   ├── config/
│   │   └── db.js
│   ├── app.js
│   └── server.js
├── sql/
│   ├── schema.sql
│   └── seed.sql
├── .env
├── .env.example
├── package.json
└── README.md
```

## Quick Start Guide

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run Backend Server
```bash
npm start
# or for development mode with auto-reload:
npm run dev
```

The API will be accessible at: `http://localhost:5000/api`

## Environment Variables
Create a `.env` file in the `backend/` root directory:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mplad_prototype
```
*(Note: PostgreSQL connection is optional; if not connected, the server seamlessly runs on in-memory dummy data.)*
