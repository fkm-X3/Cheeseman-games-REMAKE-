const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { requireEnv } = require("./env");

const USERS_COLLECTION = "users";
const USER_LOOKUPS_COLLECTION = "userLookups";
const SCORES_COLLECTION = "scores";
const USER_GAME_BEST_COLLECTION = "userGameBest";

let db;

class DuplicateUserError extends Error {
  constructor(message = "Username or email already exists.") {
    super(message);
    this.name = "DuplicateUserError";
  }
}

function normalizePrivateKey(value) {
  const trimmed = value.trim();
  const unwrapped =
    trimmed.startsWith("\"") && trimmed.endsWith("\"")
      ? trimmed.slice(1, -1)
      : trimmed;
  return unwrapped.replace(/\\n/g, "\n");
}

function buildDb() {
  const projectId = requireEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requireEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = normalizePrivateKey(requireEnv("FIREBASE_PRIVATE_KEY"));

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return getFirestore();
}

function getDb() {
  if (!db) {
    db = buildDb();
  }
  return db;
}

function mapPublicUserDoc(userDoc) {
  if (!userDoc.exists) {
    return null;
  }
  const user = userDoc.data();
  return {
    id: userDoc.id,
    username: user.username,
    email: user.email,
  };
}

function mapAuthUserDoc(userDoc) {
  if (!userDoc.exists) {
    return null;
  }
  const user = userDoc.data();
  return {
    id: userDoc.id,
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash,
  };
}

async function createUser({ username, email, passwordHash }) {
  const firestore = getDb();
  const usernameLower = username.toLowerCase();
  const emailLower = email.toLowerCase();

  return firestore.runTransaction(async (tx) => {
    const userRef = firestore.collection(USERS_COLLECTION).doc();
    const usernameLookupRef = firestore
      .collection(USER_LOOKUPS_COLLECTION)
      .doc(`username:${usernameLower}`);
    const emailLookupRef = firestore
      .collection(USER_LOOKUPS_COLLECTION)
      .doc(`email:${emailLower}`);

    const [usernameLookupDoc, emailLookupDoc] = await Promise.all([
      tx.get(usernameLookupRef),
      tx.get(emailLookupRef),
    ]);

    if (usernameLookupDoc.exists || emailLookupDoc.exists) {
      throw new DuplicateUserError();
    }

    const timestamp = FieldValue.serverTimestamp();
    tx.set(userRef, {
      username,
      email,
      passwordHash,
      usernameLower,
      emailLower,
      createdAt: timestamp,
    });
    tx.set(usernameLookupRef, {
      userId: userRef.id,
      createdAt: timestamp,
    });
    tx.set(emailLookupRef, {
      userId: userRef.id,
      createdAt: timestamp,
    });

    return {
      id: userRef.id,
      username,
      email,
    };
  });
}

async function findUserByIdentifier(identifierLower) {
  const firestore = getDb();
  const lookupKey = identifierLower.includes("@")
    ? `email:${identifierLower}`
    : `username:${identifierLower}`;

  const lookupDoc = await firestore
    .collection(USER_LOOKUPS_COLLECTION)
    .doc(lookupKey)
    .get();

  if (!lookupDoc.exists) {
    return null;
  }

  const userId = lookupDoc.data().userId;
  if (!userId) {
    return null;
  }

  const userDoc = await firestore.collection(USERS_COLLECTION).doc(userId).get();
  return mapAuthUserDoc(userDoc);
}

async function findUserById(userId) {
  const userDoc = await getDb().collection(USERS_COLLECTION).doc(userId).get();
  return mapPublicUserDoc(userDoc);
}

async function submitScore({ userId, username, gameKey, score }) {
  const firestore = getDb();

  return firestore.runTransaction(async (tx) => {
    const scoreRef = firestore.collection(SCORES_COLLECTION).doc();
    const bestRef = firestore.collection(USER_GAME_BEST_COLLECTION).doc(`${userId}:${gameKey}`);
    const bestDoc = await tx.get(bestRef);
    const previousBest = bestDoc.exists ? bestDoc.data().score : null;
    const nextBest =
      typeof previousBest === "number" && previousBest > score ? previousBest : score;

    const timestamp = FieldValue.serverTimestamp();
    tx.set(scoreRef, {
      userId,
      gameKey,
      score,
      createdAt: timestamp,
    });

    const needsBestUpdate =
      !bestDoc.exists || nextBest !== previousBest || bestDoc.data().username !== username;
    if (needsBestUpdate) {
      tx.set(bestRef, {
        userId,
        gameKey,
        username,
        score: nextBest,
        updatedAt: timestamp,
      });
    }

    return nextBest;
  });
}

async function getLeaderboard({ gameKey, limit }) {
  const snapshot = await getDb()
    .collection(USER_GAME_BEST_COLLECTION)
    .where("gameKey", "==", gameKey)
    .get();

  return snapshot.docs
    .map((doc) => doc.data())
    .filter((entry) => typeof entry.username === "string" && Number.isFinite(entry.score))
    .sort((a, b) => b.score - a.score || a.username.localeCompare(b.username))
    .slice(0, limit)
    .map((entry) => ({
      username: entry.username,
      score: entry.score,
    }));
}

module.exports = {
  DuplicateUserError,
  createUser,
  findUserByIdentifier,
  findUserById,
  submitScore,
  getLeaderboard,
  getDb,
};
