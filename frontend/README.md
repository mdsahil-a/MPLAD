# MPLADS Frontend

React + Vite implementation of the frontend blueprint (Login, Dashboard, Projects List,
Project Detail, Alerts/Risk, Reports, Settings), currently running on mock data.

## Run it

```
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Folder structure

- `src/pages/` — one file per page in the blueprint
- `src/components/` — Sidebar, Topbar, Layout, StatCard, RiskBadge (reusable UI pieces)
- `src/data/mockData.js` — fake project data, shaped exactly like the future backend API
  response. Swap this out for real `fetch()` calls once the backend is ready.
- `src/styles/index.css` — design tokens (colors, spacing) and base styles.

## Connecting to the real backend

Replace the imports from `mockData.js` in each page with a `fetch('/api/...')` call
returning data in the same shape (see the fields used in `mockData.js` for the expected
contract: id, work, mp, district, sanctioned, spent, progress, risk, finSignal,
netSignal, dupSignal, photoSignal).
