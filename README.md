# Cheeseman Games Remake

A simple game site designed for Netlify hosting with a Node.js backend running as Netlify Functions.

## Features (v1)

- Static frontend with one playable game: **Catch the Cheese**
- User auth with username/email + password
- JWT session token flow
- Score submission API
- Leaderboard API (top scores per user)
- Firebase Firestore persistence

## Tech stack

- Frontend: HTML, CSS, vanilla JS (`public/`)
- Backend: Node.js Netlify Functions (`netlify/functions/`)
- Database: Firebase Firestore

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
```

## Environment variables

Copy `.env.example` to `.env` and set:

- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - service account client email
- `FIREBASE_PRIVATE_KEY` - service account private key (keep `\n` escapes in env value)
- `JWT_SECRET` - long random secret for signing JWTs

## Database setup

1. Create a Firebase project and enable Firestore (Native mode).
2. Create a service account key in Firebase Console.
3. Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` from that key.
4. Collections are created automatically when the API writes data.

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
3. Set environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `JWT_SECRET`) in Netlify site settings.
4. Deploy.
