# College ID 3D

A Next.js (App Router) app that renders a 3D ID card (Three.js) and a lightweight admin logger with Google sign‑in. ID cards are stored in Postgres (Neon) and displayed at unique URLs.

## Features
- 3D ID card using react‑three‑fiber with tiled background logo from `public/withoutext.png`.
- Public generator at `/idcard` -> creates an ID and redirects to `/idcard/[id]`.
- Dynamic card page fetches from Postgres and renders a QR to itself.
- Admin at `/admin` with Google sign‑in restricted by email, event name "Respawn", manual name field, and integrated QR scanner. Logs are stored to Postgres.

## Setup
1. Copy `.env.local` from the repo and fill the values:
	- `ADMIN_ALLOWED_EMAIL` and `NEXT_PUBLIC_ADMIN_ALLOWED_EMAIL`
	- `DATABASE_URL` (already set to your Neon URL)
	- Firebase web config (already added as NEXT_PUBLIC_* values)
	- Optional: `NEXT_PUBLIC_SITE_URL` (defaults to `http://localhost:3000`)

2. Install deps:
```powershell
npm i
```

3. Run the dev server:
```powershell
npm run dev
```

Open:
- `http://localhost:3000` – landing
- `http://localhost:3000/idcard` – generator
- `http://localhost:3000/admin` – admin console

## Database
Tables are created automatically on first API call:
- `idcards(id TEXT PRIMARY KEY, name TEXT, created_at TIMESTAMPTZ)`
- `logs(id BIGSERIAL, event_name TEXT, name TEXT, idcard_id TEXT, admin_email TEXT, created_at TIMESTAMPTZ)`

## Notes
- The 3D card artwork is programmatically drawn onto a canvas to resemble the provided template. Adjust fonts/colors in `components/IDCardCanvas.jsx` as needed.
- The admin email check happens on the client for convenience; for stronger enforcement, add server‑side checks to the admin APIs.
