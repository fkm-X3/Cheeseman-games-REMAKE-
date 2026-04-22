const state = {
  token: localStorage.getItem("authToken"),
  user: null,
  game: {
    running: false,
    timeLeft: 20,
    score: 0,
    timerId: null,
  },
};

const authStatusEl = document.getElementById("auth-status");
const logoutButtonEl = document.getElementById("logout-button");
const registerFormEl = document.getElementById("register-form");
const loginFormEl = document.getElementById("login-form");
const startGameButtonEl = document.getElementById("start-game-button");
const cheeseButtonEl = document.getElementById("cheese-button");
const gameAreaEl = document.getElementById("game-area");
const timeLeftEl = document.getElementById("time-left");
const currentScoreEl = document.getElementById("current-score");
const gameMessageEl = document.getElementById("game-message");
const leaderboardListEl = document.getElementById("leaderboard-list");
const refreshLeaderboardButtonEl = document.getElementById("refresh-leaderboard-button");
const globalMessageEl = document.getElementById("global-message");

function setGlobalMessage(message) {
  globalMessageEl.textContent = message;
}

async function api(path, options = {}) {
  const method = options.method || "GET";
  const headers = { "Content-Type": "application/json" };

  if (options.auth !== false && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
}

function updateAuthUI() {
  if (state.user) {
    authStatusEl.textContent = `Signed in as ${state.user.username}`;
    logoutButtonEl.hidden = false;
  } else {
    authStatusEl.textContent = "You are not signed in.";
    logoutButtonEl.hidden = true;
  }
}

function setToken(token) {
  state.token = token;
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

async function loadCurrentUser() {
  if (!state.token) {
    state.user = null;
    updateAuthUI();
    return;
  }

  try {
    const payload = await api("/api/auth/me");
    state.user = payload.user;
  } catch (error) {
    setToken(null);
    state.user = null;
    setGlobalMessage(error.message);
  }
  updateAuthUI();
}

function moveCheeseButton() {
  const areaRect = gameAreaEl.getBoundingClientRect();
  const cheeseRect = cheeseButtonEl.getBoundingClientRect();
  const maxLeft = Math.max(0, areaRect.width - cheeseRect.width);
  const maxTop = Math.max(0, areaRect.height - cheeseRect.height);

  const left = Math.floor(Math.random() * (maxLeft + 1));
  const top = Math.floor(Math.random() * (maxTop + 1));

  cheeseButtonEl.style.left = `${left}px`;
  cheeseButtonEl.style.top = `${top}px`;
}

function renderGameStats() {
  timeLeftEl.textContent = String(state.game.timeLeft);
  currentScoreEl.textContent = String(state.game.score);
}

async function submitScore(score) {
  if (!state.user) {
    setGlobalMessage("Sign in to submit your score.");
    return;
  }

  const payload = await api("/api/leaderboard/submit", {
    method: "POST",
    body: {
      score,
      gameKey: "cheese-clicker",
    },
  });

  setGlobalMessage(`Score submitted. Personal best: ${payload.personalBest}`);
  await loadLeaderboard();
}

function stopGame() {
  if (state.game.timerId) {
    window.clearInterval(state.game.timerId);
  }
  state.game.running = false;
  state.game.timerId = null;
  cheeseButtonEl.hidden = true;
  startGameButtonEl.disabled = false;
}

async function finishGame() {
  stopGame();
  gameMessageEl.textContent = `Game over! Final score: ${state.game.score}`;
  if (state.game.score > 0) {
    try {
      await submitScore(state.game.score);
    } catch (error) {
      setGlobalMessage(error.message);
    }
  }
}

function startGame() {
  if (state.game.running) {
    return;
  }

  state.game.running = true;
  state.game.timeLeft = 20;
  state.game.score = 0;
  renderGameStats();

  startGameButtonEl.disabled = true;
  cheeseButtonEl.hidden = false;
  gameMessageEl.textContent = "Catch the cheese!";
  setGlobalMessage("");
  moveCheeseButton();

  state.game.timerId = window.setInterval(() => {
    state.game.timeLeft -= 1;
    renderGameStats();
    if (state.game.timeLeft <= 0) {
      finishGame();
    }
  }, 1000);
}

async function loadLeaderboard() {
  try {
    const payload = await api("/api/leaderboard/top?gameKey=cheese-clicker&limit=10", {
      auth: false,
    });
    const items = payload.leaderboard || [];

    leaderboardListEl.innerHTML = "";
    if (!items.length) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "No scores yet.";
      leaderboardListEl.appendChild(emptyItem);
      return;
    }

    items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${item.username} - ${item.score}`;
      leaderboardListEl.appendChild(listItem);
    });
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

registerFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registerFormEl);
  try {
    const payload = await api("/api/auth/register", {
      method: "POST",
      auth: false,
      body: {
        username: String(formData.get("username") || ""),
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
      },
    });

    setToken(payload.token);
    state.user = payload.user;
    updateAuthUI();
    registerFormEl.reset();
    setGlobalMessage("Account created and signed in.");
    await loadLeaderboard();
  } catch (error) {
    setGlobalMessage(error.message);
  }
});

loginFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginFormEl);
  try {
    const payload = await api("/api/auth/login", {
      method: "POST",
      auth: false,
      body: {
        identifier: String(formData.get("identifier") || ""),
        password: String(formData.get("password") || ""),
      },
    });

    setToken(payload.token);
    state.user = payload.user;
    updateAuthUI();
    loginFormEl.reset();
    setGlobalMessage("Signed in.");
    await loadLeaderboard();
  } catch (error) {
    setGlobalMessage(error.message);
  }
});

logoutButtonEl.addEventListener("click", () => {
  setToken(null);
  state.user = null;
  updateAuthUI();
  setGlobalMessage("Signed out.");
});

startGameButtonEl.addEventListener("click", startGame);

cheeseButtonEl.addEventListener("click", () => {
  if (!state.game.running) {
    return;
  }
  state.game.score += 1;
  renderGameStats();
  moveCheeseButton();
});

refreshLeaderboardButtonEl.addEventListener("click", () => {
  loadLeaderboard();
});

window.addEventListener("resize", () => {
  if (state.game.running) {
    moveCheeseButton();
  }
});

updateAuthUI();
renderGameStats();
loadCurrentUser().then(loadLeaderboard);
