# Book Reading — Deployment

Quick notes for building and deploying this site so Google login and API calls work in production.

1) Create production env

 - Copy the example and fill real values (DO NOT commit real secrets):

```bash
cp .env.production.example .env.production
# then edit .env.production and set your real values
```

Required variables:

- `VITE_GOOGLE_CLIENT_ID` — Google OAuth client ID for your web app
- `VITE_API_BASE` — Base URL of your production API (example: `https://api.example.com/api`)

2) Build

Set the environment variables (example for PowerShell):

```powershell
$env:VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
$env:VITE_API_BASE="https://your.production.api.example.com/api"
npm run build
```

Or rely on `.env.production` during build (Vite loads `.env.*` files).

3) Deploy

 - Deploy the contents of `dist/` to your hosting (GitHub Pages, Netlify, Vercel, etc.).
 - If you use GitHub Pages, ensure the built bundle is what you publish — GitHub Pages cannot access `localhost` for API calls.

4) Troubleshooting

 - If you see "Missing required parameter client_id" in the browser console, it means `VITE_GOOGLE_CLIENT_ID` was not set at build time.
 - If your library shows empty lists and network requests return HTML (ngrok error), ensure `VITE_API_BASE` points to a reachable JSON API origin and CORS is configured on the backend.

If you want, I can commit and push these example files now (no secrets included). Or I can add a conditional guard in code that disables Google buttons when `VITE_GOOGLE_CLIENT_ID` is missing — tell me which you prefer.
# Book Reading — Environment & Deploy

Environment variables

- Create a file named `.env.production` from `.env.production.example` and fill in real values.

Example `.env.production` (DO NOT commit):

```
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
VITE_API_BASE=https://your.production.api
```

Build & deploy

1. Ensure `.env.production` is present and correct.
2. Build the production bundle:

```bash
npm run build
```

3. Deploy contents of the `dist/` folder to your static host (GitHub Pages, Netlify, etc.).

Notes
- Keep `VITE_GOOGLE_CLIENT_ID` private. Do not commit `.env.production` to the repository.
- If you don't supply a production API URL, the app falls back to the hardcoded ngrok URL and then to `http://localhost/api` (development-only fallback).