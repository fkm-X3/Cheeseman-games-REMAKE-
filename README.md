# Cheeseman Games Remake

A simple game site designed for Netlify hosting with a Node.js backend running as Netlify Functions.

## Features (v1)

- Static frontend with one playable game: **Catch the Cheese**
- User auth with username/email + password
- JWT session token flow
- Score submission API
- Leaderboard API (top scores per user)
- Supabase Postgres persistence

## Tech stack

- Frontend: HTML, CSS, vanilla JS (`public/`)
- Backend: Node.js Netlify Functions (`netlify/functions/`)
- Database: Supabase Postgres (`supabase/schema.sql`)

## Project structure

```txt
public/
  index.html
  style.css
  app.js
netlify/
  functions/
    _lib/
      auth.js
      db.js
      env.js
      response.js
      validation.js
    auth-register.js
    auth-login.js
    auth-me.js
    leaderboard-submit.js
    leaderboard-top.js
supabase/
  schema.sql
```

## Environment variables

Copy `.env.example` to `.env` and set:

- `SUPABASE_DB_URL` - Postgres connection string from Supabase
- `JWT_SECRET` - long random secret for signing JWTs

## Database setup

Run the SQL in `supabase/schema.sql` against your Supabase database.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and fill in values.

3. Start local Netlify dev server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Netlify CLI.

## API routes

Through Netlify redirects:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/leaderboard/submit`
- `GET /api/leaderboard/top?gameKey=cheese-clicker&limit=10`

## Deployment to Netlify

1. Push repository to GitHub.
2. Connect the repo in Netlify.
3. Set environment variables (`SUPABASE_DB_URL`, `JWT_SECRET`) in Netlify site settings.
4. Deploy.
