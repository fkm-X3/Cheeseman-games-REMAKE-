# Cheeseman Games Remake

A Next.js (App Router) game site ready for Vercel deployment, with Firebase-backed auth and leaderboard APIs.

## Features

- Catch the Cheese browser game
- Username/email registration and login
- JWT session flow
- Score submission and leaderboard APIs
- Firebase Firestore persistence
- Write origin allowlist for mutating API routes

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
- `ALLOWED_WRITE_ORIGINS` - optional comma-separated override for write route origin checks (defaults to `https://cheeseman-games-remake.vercel.app`; localhost is also allowed outside production)

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

## Write security model

- All database writes happen through server API routes using `firebase-admin`.
- Mutating routes enforce an origin allowlist and return `403` for disallowed origins.
- Firestore rules in `firestore.rules` deny direct client writes and only expose validated leaderboard read documents.
- Deploy Firestore rules with:

  ```bash
  npm run firebase:deploy:rules
  ```

## Deployment to Vercel

1. Push repository to GitHub.
2. Import the repository in Vercel.
3. Set environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `JWT_SECRET`, optional `ALLOWED_WRITE_ORIGINS`) in Vercel project settings.
4. Deploy.
5. Deploy Firestore rules (`npm run firebase:deploy:rules`) with Firebase CLI access to the target project.
