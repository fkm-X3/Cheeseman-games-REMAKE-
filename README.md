# Cheeseman Games Remake

A Next.js (App Router) game site ready for Vercel deployment, with Firebase-backed auth and leaderboard APIs.

## Features

- Catch the Cheese browser game
- Username/email registration and login
- JWT session flow
- Score submission and leaderboard APIs
- Firebase Firestore persistence

## Tech stack

- Frontend + backend runtime: Next.js App Router (`app/` and `app/api/`)
- Server modules: `lib/server/`
- Database: Firebase Firestore
- Deployment target: Vercel

## Project structure

```txt
app/
  api/
    auth/
      login/route.js
      me/route.js
      register/route.js
    leaderboard/
      submit/route.js
      top/route.js
  globals.css
  layout.js
  page.js
lib/
  server/
    auth.mjs
    db.mjs
    env.mjs
    validation.mjs
```

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - service account client email
- `FIREBASE_PRIVATE_KEY` - service account private key (keep `\n` escapes in env value)
- `JWT_SECRET` - long random secret for signing JWTs

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and fill in values.

3. Start the Next.js dev server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/leaderboard/submit`
- `GET /api/leaderboard/top?gameKey=cheese-clicker&limit=10`

## Deployment to Vercel

1. Push repository to GitHub.
2. Import the repository in Vercel.
3. Set environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `JWT_SECRET`) in Vercel project settings.
4. Deploy.
