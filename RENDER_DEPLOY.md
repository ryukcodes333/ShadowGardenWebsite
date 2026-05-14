# Shadow Garden — Render Deployment Guide

This guide walks you through deploying Shadow Garden (API + Frontend) to Render.com for free.

---

## What Gets Deployed

| Service | Type | Description |
|---|---|---|
| `shadow-garden-api` | Web Service (Node.js) | Express API server |
| `shadow-garden-web` | Static Site | React frontend (Vite build) |

---

## Prerequisites

1. **Supabase project** — create one free at [supabase.com](https://supabase.com)
2. **Render account** — sign up free at [render.com](https://render.com)
3. **Groq API key** — get one free at [console.groq.com](https://console.groq.com)
4. Run `schema.sql` in your Supabase SQL Editor first (see below)

---

## Step 1 — Set Up Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Click **SQL Editor** → **New Query**
3. Paste the entire contents of `schema.sql` and click **Run**
4. Go to **Table Editor** → select `sg_chat_messages` → **Edit table** → enable **Realtime**
5. Go to **Project Settings** → **API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `service_role` key (under "Project API keys") → this is your `SUPABASE_SERVICE_KEY`

---

## Step 2 — Deploy the API Server

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo (push this project to GitHub first)
3. Configure:
   - **Name**: `shadow-garden-api`
   - **Root Directory**: `artifacts/api-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Plan**: Free

4. Add these **Environment Variables** (click "Add Environment Variable"):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `SESSION_SECRET` | Any long random string (e.g. generate at [randomkeygen.com](https://randomkeygen.com)) |
   | `SUPABASE_URL` | Your Supabase Project URL |
   | `SUPABASE_SERVICE_KEY` | Your Supabase service_role key |
   | `GROQ_API_KEY` | Your Groq API key |
   | `BOT_SECRET_KEY` | Any secret string — bots use this to poll for OTPs |

5. Click **Create Web Service** and wait for it to deploy (~3 minutes)
6. Once deployed, copy the URL shown (e.g. `https://shadow-garden-api.onrender.com`) — you'll need it next

---

## Step 3 — Deploy the Frontend

1. Go to Render → **New** → **Static Site**
2. Connect the same GitHub repo
3. Configure:
   - **Name**: `shadow-garden-web`
   - **Root Directory**: `artifacts/shadow-garden`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add this **Environment Variable**:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | Your API URL from Step 2 (e.g. `https://shadow-garden-api.onrender.com`) |

5. Add a **Redirect/Rewrite Rule**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Type**: Rewrite (for SPA routing)

6. Click **Create Static Site** and wait (~2 minutes)
7. Your frontend URL will be shown (e.g. `https://shadow-garden-web.onrender.com`)

---

## Step 4 — Connect Frontend to API (CORS)

The API needs to allow requests from your frontend domain.

In your Render API service, add one more environment variable:

| Key | Value |
|---|---|
| `ALLOWED_ORIGIN` | Your frontend URL (e.g. `https://shadow-garden-web.onrender.com`) |

The API already reads this variable for CORS. Redeploy the API after adding it (Render does this automatically).

---

## Step 5 — Using the Blueprint (Faster Method)

If your repo has `render.yaml` at the root (it does), you can deploy both services at once:

1. Go to [render.com/deploy](https://render.com/deploy)
2. Connect your GitHub repo
3. Render will detect `render.yaml` and set up both services automatically
4. You'll still need to fill in the secret environment variables manually

---

## Step 6 — OTP Bot Integration

For bots to send OTP codes via WhatsApp:

1. Your bot needs `BOT_SECRET_KEY` set to the same value as the API
2. Bot polls this endpoint every 10 seconds:
   ```
   GET https://shadow-garden-api.onrender.com/api/auth/pending-otps
   Headers: x-bot-key: <BOT_SECRET_KEY>
   ```
3. For each OTP returned, bot claims it (prevents duplicate sends):
   ```
   POST https://shadow-garden-api.onrender.com/api/auth/claim-otp/<otp_id>
   Headers: x-bot-key: <BOT_SECRET_KEY>, Content-Type: application/json
   Body: { "bot_name": "Alpha" }
   ```
4. Bot then sends the `code` to the `whatsapp_number` via WhatsApp

---

## Free Tier Limits

- Render free web services **spin down after 15 minutes of inactivity** — first request after sleep takes ~30 seconds
- To keep it awake: use [UptimeRobot](https://uptimerobot.com) to ping `/api/healthz` every 5 minutes (free)
- Static sites never sleep — they're always fast

---

## Custom Domain (Optional)

1. In your Render service, go to **Settings** → **Custom Domains**
2. Add your domain and follow the DNS instructions
3. Render provides free SSL automatically

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Login says "Invalid credentials" | Make sure you ran `schema.sql` in Supabase |
| Cards page empty | Run `schema.sql` to seed the cards data |
| Chat not working | Enable Realtime on `sg_chat_messages` table in Supabase |
| API returns 500 | Check Render logs — likely missing environment variables |
| CORS errors in browser | Set `ALLOWED_ORIGIN` env var on the API to match your frontend URL |
