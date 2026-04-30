
const CUBE_DATA = [
    {
        id: 1, name: "Sword Master", color: "blue", hp: 100, attacks: "Slash, Parry",
        attack1: "[SPACE] Slash: Standard melee attack. Deals 25 dmg.",
        attack2: "[F] Parry: Turns black. Reflects attacks and stuns enemy.",
        counter: "Do not attack when he turns black (Parry). Wait for the parry to end (1 sec) then punish."
    },
    {
        id: 2, name: "Angry Sniper", color: "red", hp: 100, attacks: "Dash (No CD), Laser",
        attack1: "[SPACE] Dash: Quick burst charge. No cooldown.",
        attack2: "[F] Laser: Long range beam. Deals 30 dmg.",
        counter: "The Dash has no cooldown but short range. The Laser has a long windup (turns Cyan/Black). Jump over the laser."
    },
    {
        id: 3, name: "Sniper Cube", color: "green", hp: 100, attacks: "Slash, Laser (Windup)",
        attack1: "[SPACE] Slash: Standard melee.",
        attack2: "[F] Laser: Charges up (flashing) then fires a full screen beam (25 dmg).",
        counter: "Hit him while he is charging the laser. He cannot move while charging."
    },
    {
        id: 4, name: "Magic Cube", color: "hotpink", hp: 100, attacks: "Slash, Block (Bar)",
        attack1: "[SPACE] Slash: Standard melee.",
        attack2: "[F] Block: Creates a shield. Drains energy bar. Negates damage.",
        counter: "Wait for the blue energy bar to deplete. He cannot block forever."
    },
    {
        id: 5, name: "The Jorker", color: "#8B4513", hp: 75, attacks: "Kick, Laser (Windup)",
        attack1: "[SPACE] Kick: Short range, high knockback. 15 dmg + Stun.",
        attack2: "[F] Laser: Yellow beam. 25 dmg.",
        counter: "Low HP (75). Rush him down, but stay out of Kick range to avoid being stunned."
    },
    {
        id: 6, name: "Ima Touch You", color: "indigo", hp: 75, attacks: "Slash, Pull (Invert)",
        attack1: "[SPACE] Slash: Standard melee.",
        attack2: "[F] Pull: Drags enemy closer. If very close, inverts controls.",
        counter: "Low HP. If you see the purple line, run away to break the tether before he touches you."
    },
    {
        id: 7, name: "Vigilante", color: "#2F4F4F", hp: 125, attacks: "Takedown, Drone Support",
        attack1: "[SPACE] Takedown: High speed dash. 20 dmg + knockback.",
        attack2: "[F] Drone: Deploys a drone that shoots automatically.",
        counter: "High HP. Destroy the drone if possible (or just dodge). Jump over the Takedown dash."
    },
    {
        id: 8, name: "Fbt_7 (Secret)", color: "black", hp: 200, attacks: "Delete (Poison), Error 404, Hatred, Termination",
        attack1: "[SPACE] Delete: Poison Slash. [F] 404: Stun/Clone. [Q] Hatred: Rage Mode. [E] Termination: Ultimate.",
        attack2: "Developer character with OP stats.",
        counter: "Run. Survive the Hatred mode (Red glow) by kiting. Pray he misses the Delete slash.",
        dev: true
    },
    {
        id: 9, name: "Master Cube", color: "#FFD700", hp: "100", attacks: "Call back, Overtime",
        attack1: "[SPACE] Overtime: Buffs minion stats to 100%.",
        attack2: "[F] Call Back: Swaps out for a random Minion.",
        counter: "Kill the minion. When the Master returns, he is vulnerable before he can swap again."
    },
    {
        id: 10, name: "Bobbythe124", color: "#CCCCFF", hp: 149, attacks: "Silence, Hatred, Beam, Bleed",
        attack1: "[SPACE] Silence: 35 dmg. [F] Beam: 50 dmg. [E] Bleed: Poison DoT.",
        attack2: "Passive: Jumps get higher each time.",
        counter: "Do not get hit by Silence. Watch out for his super high jumps - he can attack from above.",
        dev: true
    }
];

let selectedCubeId = 1; 

let ACHIEVEMENT_DATA = [
    { id: 1, name: "First Blood", desc: "Win your first battle", unlocks: "Sniper Cube", unlocked: false },
    { id: 2, name: "Sharpshooter", desc: "Hit 15 beams total (Red Cube)", unlocks: "Magic Cube", unlocked: false, progress: 0, maxProgress: 15 },
    { id: 3, name: "Unstoppable", desc: "Win without taking damage", unlocks: "The Jorker", unlocked: false },
    { id: 4, name: "Wombo Combo", desc: "Counter an attack then hit every shot to win", unlocks: "Ima Touch You", unlocked: false },
    { id: 5, name: "In every timeline I kill you...", desc: "Lose to Fbt_7  ", unlocks: "Vigilante", unlocked: false },
    { id: 6, name: "Not like this", desc: "Fbt_7 vs Bobbythe124", unlocks: "The heartbreaking (placeholder)", unlocked: false },
    { id: 7, name: "Cube Master", desc: "Unlock all other cubes", unlocks: "Master Cube", unlocked: false }
];





if (localStorage.getItem('cc_debugMode') === null) localStorage.setItem('cc_debugMode', 'false');
if (localStorage.getItem('cc_dev') === null) localStorage.setItem('cc_dev', 'false');
if (localStorage.getItem('cc_tester') === null) localStorage.setItem('cc_tester', 'false');


const IS_DEBUG_MODE = localStorage.getItem('cc_debugMode') === 'true';
const IS_DEV = localStorage.getItem('cc_dev') === 'true';       
const IS_TESTER = localStorage.getItem('cc_tester') === 'true'; 


if (IS_DEBUG_MODE) {
    console.log("DEBUG MODE ACTIVE: Unlocking all achievements...");
    
    setTimeout(() => unlockAllAchievements(true), 100);
}

if (IS_DEV) console.log("Welcome Developer.");
if (IS_TESTER) console.log("Tester Access Granted.");



const savedData = localStorage.getItem('cubeCombatData');
if (savedData) {
    const parsed = JSON.parse(savedData);
    ACHIEVEMENT_DATA.forEach(ach => {
        const saved = parsed.find(p => p.id === ach.id);
        if (saved) {
            if (saved.unlocked) ach.unlocked = true;
            if (saved.progress !== undefined) ach.progress = saved.progress; 
        }
    });
}

function saveGameData() {
    const toSave = ACHIEVEMENT_DATA.map(a => ({
        id: a.id,
        unlocked: a.unlocked,
        progress: a.progress
    }));
    localStorage.setItem('cubeCombatData', JSON.stringify(toSave));
}

function confirmResetProgress() {
    if (window.confirm("WARNING: Reset all progress?")) {
        localStorage.removeItem('cubeCombatData');
        ACHIEVEMENT_DATA.forEach(ach => {
            ach.unlocked = false;
            if (ach.progress !== undefined) ach.progress = 0;
        });
        selectedCubeId = 1;
        alert("Progress reset.");
        navTo('screen-main');
    }
}

function unlockAllAchievements(silent = false) {
    ACHIEVEMENT_DATA.forEach(ach => {
        ach.unlocked = true;
        if (ach.maxProgress) ach.progress = ach.maxProgress;
    });
    saveGameData();
    renderAchievements();

    
    if (!silent) {
        alert("All achievements unlocked via Debug Mode!");
    }
}

function unlockAchievement(id) {
    const ach = ACHIEVEMENT_DATA.find(a => a.id === id);
    if (ach && !ach.unlocked) {
        ach.unlocked = true;
        showAchievementToast(ach.name);
        saveGameData();

        if (ACHIEVEMENT_DATA.filter(a => a.id !== 6).every(a => a.unlocked)) unlockAchievement(6);
    }
}

function showAchievementToast(name) {
    const toast = document.getElementById('achievement-toast');
    document.getElementById('toast-message').innerText = name;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}


let sessionStats = {
    beamStreak: 0,
    womboComboActive: false,
    womboComboHits: 0
};
let floatingTexts = []; 
let particles = []; 
let shakeMagnitude = 0; 


let isRetroMode = false;
let shatterActive = false;
let shatterShards = [];


let peer = null;
let conn = null;
let p2pRole = null;
let networkKeys = {};


let pendingGameMode = null;
let returnScreenId = 'screen-main';

function quitGame() {
    if (window.parent && typeof window.parent.closeGame === 'function') {
        window.parent.closeGame();
    } else {
        window.location.href = '/';
    }
}

function navTo(screenId) {
    document.querySelectorAll('.menu-screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}


function prepareGame(mode, fromScreen) {
    pendingGameMode = mode;
    returnScreenId = fromScreen || 'screen-main';
    navTo('screen-cubes');
    renderCubes();
}

function handleCubeBack() {
    navTo(returnScreenId);
    pendingGameMode = null;
}

function confirmSelection() {
    if (!pendingGameMode) return;

    if (pendingGameMode === 'p2p_setup') {
        
        navTo('screen-p2p-lobby');
    } else {
        
        startGame(pendingGameMode);
    }
}

function renderCubes() {
    const container = document.getElementById('cubes-grid-container');
    container.innerHTML = '';

    
    const actionBtn = document.getElementById('btn-confirm-selection');
    if (pendingGameMode) {
        actionBtn.style.display = 'block';
        actionBtn.innerText = (pendingGameMode === 'p2p_setup') ? 'TO LOBBY >' : 'FIGHT!';
    } else {
        actionBtn.style.display = 'none';
    }

    
    
    let displayList = CUBE_DATA.filter(c => !c.dev || IS_DEV);

    
    const masterCube = displayList.find(c => c.id === 9);
    const masterUnlocked = ACHIEVEMENT_DATA.find(a => a.id === 6).unlocked;

    
    displayList = displayList.filter(c => c.id !== 9);

    
    if (masterUnlocked && masterCube) {
        displayList.unshift(masterCube);
    }

    displayList.forEach((cube) => {
        const div = document.createElement('div');

        let isLocked = false;

        
        if (cube.id !== 9 && cube.id !== 10 && cube.id > 2) {
            const unlockingAchievement = ACHIEVEMENT_DATA.find(a => a.unlocks === cube.name);
            if (unlockingAchievement && !unlockingAchievement.unlocked) {
                isLocked = true;
            }
        }

        div.className = 'cube-icon' + (isLocked ? ' locked' : '') + (selectedCubeId === cube.id ? ' selected' : '');
        div.style.backgroundColor = cube.color;

        if (!isLocked) {
            div.onclick = () => {
                selectedCubeId = cube.id;
                selectCube(cube, div);
                renderCubes();
            };
        } else {
            div.title = 'Locked';
        }
        container.appendChild(div);
    });

    
    const currentCube = CUBE_DATA.find(c => c.id === selectedCubeId);
    if (currentCube) selectCube(currentCube, null);
}

function selectCube(cube, element) {
    const panel = document.getElementById('cube-details-panel');
    panel.innerHTML = `
    <div style="text-align:center; margin-bottom:20px;">
        <div style="background:${cube.color}; width:80px; height:80px; display:inline-block; border:2px solid white;"></div>
    </div>
    <div class="detail-row"><div class="detail-label">Name:</div><div class="detail-value">${cube.name}</div></div>
    <div class="detail-row"><div class="detail-label">Color:</div><div class="detail-value" style="text-transform:capitalize;">${cube.color}</div></div>
    <div class="detail-row"><div class="detail-label">Max HP:</div><div class="detail-value">${cube.hp}</div></div>
    <div class="detail-row"><div class="detail-label">Attacks:</div><div class="detail-value">${cube.attacks}</div></div>
    <div style="margin-top:20px; color:#00FF00; font-weight:bold; text-align:center;">${selectedCubeId === cube.id ? 'SELECTED' : ''}</div>
`;
}

function renderAchievements() {
    const container = document.getElementById('achievements-container');
    container.innerHTML = '';
    ACHIEVEMENT_DATA.forEach(ach => {
        const div = document.createElement('div');
        div.className = `achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`;

        
        let progressHtml = '';
        if (ach.maxProgress) {
            const current = ach.progress || 0;
            const pct = Math.min(100, (current / ach.maxProgress) * 100);
            progressHtml = `
            <div style="width: 100%; background: #222; height: 10px; margin-top: 8px; border-radius: 5px; position: relative; border: 1px solid #555;">
                <div style="width: ${pct}%; background: ${ach.unlocked ? '#00aa00' : '#00FFFF'}; height: 100%; border-radius: 5px; transition: width 0.3s;"></div>
                <div style="position: absolute; top: -18px; right: 0; font-size: 12px; color: #ccc;">${current}/${ach.maxProgress}</div>
            </div>
        `;
        }

        div.innerHTML = `
        <div style="width: 100%;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size: 24px; font-weight:bold;">#${ach.id} - ${ach.name}</div>
                <div style="font-size: 20px; font-weight:bold;">${ach.unlocked ? 'UNLOCKED' : 'LOCKED'}</div>
            </div>
            <div style="font-size: 16px; margin-top:5px;">${ach.desc}</div>
            ${progressHtml}
            <div style="font-size: 14px; margin-top:5px; font-style:italic;">Unlocks: ${ach.unlocks}</div>
        </div>
    `;
        container.appendChild(div);
    });
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = 800;
const HEIGHT = 600;

const GRAVITY = 0.6;
const FRICTION = 0.8;
const MOVE_SPEED = 5;
const JUMP_FORCE = 14;
const FLOOR_Y = HEIGHT - 50;
const CUBE_SIZE = 50;

const COLORS = {
    BLUE: '#0000FF',
    RED: '#FF0000',
    CYAN: '#00FFFF',
    PURPLE: '#800080',
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    GRAY: '#C8C8C8'
};

let gameMode = 'ai';
let gameState = 'menu';
let winner = null;
let animationId = null;

let keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Escape') {
        if (gameState === 'playing') showMainMenu();
        else if (gameState === 'menu' && !document.getElementById('screen-main').classList.contains('active')) {
            if (document.getElementById('screen-cubes').classList.contains('active')) {
                handleCubeBack();
            } else {
                navTo('screen-main');
            }
        }
    }
    if (e.code === 'KeyR') {
        if (gameState === 'gameover') requestRestart();
        if (gameState === 'playing' && gameMode === 'sandbox') toggleSandboxMenu();
    }
});
window.addEventListener('keyup', e => keys[e.code] = false);


const PEER_CONFIG = {
    debug: 2,
    config: {
        'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    }
};

function initP2PHost() {
    resetP2P();
    document.getElementById('p2p-buttons').style.display = 'none';
    document.getElementById('p2p-host-section').style.display = 'block';
    updateP2PStatus("Initializing Peer...", "yellow");

    try {
        peer = new Peer(null, PEER_CONFIG);

        peer.on('open', (id) => {
            document.getElementById('host-id-display').value = id;
            updateP2PStatus("Waiting for Player 2 to join...", "#00aa00");
            p2pRole = 'host';
        });

        peer.on('connection', (c) => {
            conn = c;
            setupConnection();
        });

        peer.on('error', (err) => {
            console.error("Peer Error:", err);
            updateP2PStatus("Error: " + err.type, "red");
        });
    } catch (e) {
        updateP2PStatus("PeerJS Init Failed", "red");
        console.error(e);
    }
}

function initP2PJoin() {
    resetP2P();
    document.getElementById('p2p-buttons').style.display = 'none';
    document.getElementById('p2p-join-section').style.display = 'block';
    p2pRole = 'client';
    updateP2PStatus("Enter Host ID to connect", "white");
}

function connectToHost() {
    const hostId = document.getElementById('join-id-input').value.trim();
    if (!hostId) return alert("Please enter the Host ID");

    updateP2PStatus("Connecting...", "yellow");

    try {
        peer = new Peer(null, PEER_CONFIG);

        peer.on('open', () => {
            conn = peer.connect(hostId, { reliable: true });
            setupConnection();
        });

        peer.on('error', (err) => {
            console.error("Peer Error:", err);
            updateP2PStatus("Connection Error: " + err.type, "red");
        });
    } catch (e) {
        updateP2PStatus("PeerJS Init Failed", "red");
        console.error(e);
    }
}

function updateP2PStatus(msg, color) {
    const el = document.getElementById('p2p-status-msg');
    el.innerText = msg;
    if (color) el.style.color = color;
}

function setupConnection() {
    conn.on('open', () => {
        updateP2PStatus("Connected! Syncing...", "#00FFFF");

        
        if (p2pRole === 'client') {
            
            conn.send({ type: 'READY', id: selectedCubeId });
        }
        
    });

    conn.on('data', (data) => handleNetworkData(data));

    conn.on('close', () => {
        alert("Connection lost");
        showMainMenu();
    });

    conn.on('error', (err) => {
        console.error("Conn Error:", err);
        alert("Connection Error");
    });
}

function resetP2P() {
    if (peer) peer.destroy();
    peer = null;
    conn = null;
    p2pRole = null;
    networkKeys = {};
    document.getElementById('p2p-buttons').style.display = 'block';
    document.getElementById('p2p-host-section').style.display = 'none';
    document.getElementById('p2p-join-section').style.display = 'none';
    document.getElementById('p2p-status-msg').innerText = "Select Host or Join";
    document.getElementById('join-id-input').value = "";
}

function handleNetworkData(data) {
    try {
        if (data.type === 'INPUT') {
            networkKeys = data.keys;
        }
        else if (data.type === 'READY') {
            if (p2pRole === 'host') {
                updateP2PStatus("Player 2 Ready! Starting...", "#00FF00");
                const p2Id = data.id || 1; 
                
                const startMsg = {
                    type: 'START_GAME',
                    p1Id: selectedCubeId,
                    p2Id: p2Id
                };
                conn.send(startMsg);
                startGame('p2p', startMsg);
            }
        }
        else if (data.type === 'START_GAME') {
            if (p2pRole === 'client') {
                startGame('p2p', data);
            }
        }
        else if (data.type === 'STATE') {
            if (gameState === 'playing' && blueCube && redCube) {
                applyStateToCube(blueCube, data.p1);
                applyStateToCube(redCube, data.p2);
                updateUI();

                
                isRetroMode = data.isRetroMode;
                shatterActive = data.shatterActive;
                if (data.shards) shatterShards = data.shards;
            }
        }
        else if (data.type === 'GAMEOVER') {
            gameState = 'gameover';
            winner = data.winner;
            showGameOver();
        }
        else if (data.type === 'RESTART') {
            restartGame(true);
        }
    } catch (e) {
        console.error("Network Data Error:", e);
    }
}

function applyStateToCube(cube, state) {
    cube.x = state.x;
    cube.y = state.y;
    cube.color = state.color;
    cube.hp = state.hp;
    cube.dead = cube.hp <= 0;
    cube.facingRight = state.facingRight;
}



class Particle {
    constructor(x, y, color, speed, life, type = 'spark') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.type = type;
        this.size = Math.random() * 3 + 2;
        this.gravity = 0.2;

        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        if (type === 'beam_charge') {
            this.gravity = 0;
            this.vx = 0;
            this.vy = 0;
        } else if (type === 'bubble') {
            this.gravity = -0.05; 
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = -Math.random() * 2;
        }
    }

    update() {
        if (this.type === 'beam_charge') {
            
            
            this.size *= 0.9;
        } else {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
        }
        this.life--;
        if (this.type !== 'bubble') this.size *= 0.95;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;

        if (this.type === 'square') {
            ctx.fillRect(this.x, this.y, this.size, this.size);
        } else if (this.type === 'bubble') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }
}

function spawnParticles(x, y, color, count, type = 'spark') {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color, Math.random() * 5 + 2, 30, type));
    }
}

function triggerShake(amount) {
    shakeMagnitude = amount;
}

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 60; 
        this.vy = -2;
    }
    update() {
        this.y += this.vy;
        this.life--;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life / 60;
        ctx.fillStyle = this.color;
        ctx.font = "bold 24px Arial";
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1.0;
    }
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

class Entity {
    constructor(x, y, color, maxHp) {
        this.x = x;
        this.y = y;
        this.w = CUBE_SIZE;
        this.h = CUBE_SIZE;
        this.color = color;
        this.baseColor = color;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.dead = false;
        this.facingRight = true;
        this.invertControlsTimer = 0; 
        this.damageMult = 1.0; 
        this.target = null;
    }

    update() {
        if (gameMode === 'p2p' && p2pRole === 'client') return;
        if (this.dead) return;

        if (this.invertControlsTimer > 0) this.invertControlsTimer--;

        if (isRetroMode) {
            
            this.x += this.vx;
            this.y += this.vy;

            
            if (this.x < 0) this.x = 0;
            if (this.x + this.w > WIDTH) this.x = WIDTH - this.w;
            if (this.y < 0) this.y = 0;
            if (this.y + this.h > HEIGHT) this.y = HEIGHT - this.h;

            this.vx *= FRICTION;
            this.vy *= FRICTION;

            if (Math.abs(this.vx) < 0.1) this.vx = 0;
            if (Math.abs(this.vy) < 0.1) this.vy = 0;

        } else {
            
            this.vy += GRAVITY;
            this.x += this.vx;
            this.y += this.vy;

            if (this.y + this.h >= FLOOR_Y) {
                this.y = FLOOR_Y - this.h;
                this.vy = 0;
                this.isGrounded = true;
            } else {
                this.isGrounded = false;
            }

            if (this.x < 0) this.x = 0;
            if (this.x + this.w > WIDTH) this.x = WIDTH - this.w;

            this.vx *= FRICTION;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }
    }

    draw(ctx) {
        if (this.dead) return;

        if (isRetroMode) {
            
            ctx.fillStyle = this.color === COLORS.BLACK ? 'blue' : (this.color === COLORS.RED ? 'red' : this.color);
            
            if (this === blueCube) ctx.fillStyle = "blue";
            if (this === redCube) ctx.fillStyle = "red";

            ctx.fillRect(this.x, this.y, this.w, this.h);
            return;
        }

        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        
        if (this.invertControlsTimer > 0) {
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("?", this.x + 20, this.y - 10);
        }

        ctx.fillStyle = "white";
        const eyeX = this.facingRight ? this.x + 30 : this.x + 10;
        ctx.fillRect(eyeX, this.y + 10, 10, 10);
    }

    takeDamage(amount) {
        if (gameMode === 'p2p' && p2pRole === 'client') return;
        if (this.dead) return;

        
        if (gameMode === 'sandbox') {
            floatingTexts.push(new FloatingText(this.x + Math.random() * 20, this.y, Math.round(amount), "#FF0000"));
            spawnParticles(this.x + this.w / 2, this.y + this.h / 2, "gray", 5, 'square');
            return; 
        }

        
        spawnParticles(this.x + this.w / 2, this.y + this.h / 2, this.color, 10, 'square');
        if (amount > 15) triggerShake(amount / 2);

        
        if (this === blueCube) {
            sessionStats.womboComboActive = false;
        }

        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
            spawnParticles(this.x + this.w / 2, this.y + this.h / 2, this.color, 40, 'square');
            checkGameOver();
        }
        updateUI();
    }
}




class BlueCube extends Entity {
    constructor() {
        super(50, FLOOR_Y - CUBE_SIZE, COLORS.BLUE, 100);
        this.slashCooldown = 0;
        this.slashActive = false;
        this.slashTimer = 0;
        this.parryActive = false;
        this.parryTimer = 0;
        this.parryCooldown = 0;
    }

    update() {
        super.update();
        if (gameMode === 'p2p' && p2pRole === 'client') return;
        if (this.dead) return;

        if (IS_TESTER) {
            this.slashCooldown = 0;
            this.parryCooldown = 0;
        }
        if (this.slashCooldown > 0) this.slashCooldown--;
        if (this.parryCooldown > 0) this.parryCooldown--;

        
        let inputLeft = keys['KeyA'];
        let inputRight = keys['KeyD'];
        let inputUp = keys['KeyW'];
        let inputDown = keys['KeyS'];

        if (this.invertControlsTimer > 0) {
            const temp = inputLeft;
            inputLeft = inputRight;
            inputRight = temp;
            const tempY = inputUp;
            inputUp = inputDown;
            inputDown = tempY;
        }

        if (!this.parryActive) {
            
            if (isRetroMode) {
                if (inputLeft) this.vx = -MOVE_SPEED;
                if (inputRight) this.vx = MOVE_SPEED;
                if (inputUp) this.vy = -MOVE_SPEED;
                if (inputDown) this.vy = MOVE_SPEED;

                if (inputRight) this.facingRight = true;
                if (inputLeft) this.facingRight = false;

                
                if (rectIntersect(this.x, this.y, this.w, this.h, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
                    if (this.slashCooldown <= 0) {
                        (this.target || redCube).takeDamage(10);
                        (this.target || redCube).vx = this.facingRight ? 10 : -10;
                        (this.target || redCube).vy = inputUp ? -10 : 10;
                        this.slashCooldown = 30;
                    }
                }

            } else {
                if (inputLeft) {
                    this.vx = -MOVE_SPEED;
                    this.facingRight = false;
                }
                if (inputRight) {
                    this.vx = MOVE_SPEED;
                    this.facingRight = true;
                }
                if (keys['KeyW'] && this.isGrounded) {
                    this.vy = -JUMP_FORCE;
                }
            }

            
            if (keys['Space'] && this.slashCooldown <= 0) {
                this.performSlash();
            }
        }

        if (keys['KeyF'] && this.parryCooldown <= 0 && !this.parryActive && !isRetroMode) {
            if (this.constructor.name === 'BlueCube' && !(this instanceof GoldCube)) {
                this.parryActive = true;
                this.parryTimer = 30;
                this.color = COLORS.BLACK;
            }
        }

        if (this.parryActive) {
            this.parryTimer--;
            this.vx = 0;
            if (this.parryTimer <= 0) {
                this.parryActive = false;
                this.color = this.baseColor;
                this.parryCooldown = 60;
            }
        }

        if (this.slashActive) {
            this.slashTimer--;
            if (this.slashTimer <= 0) this.slashActive = false;
        }
    }

    performSlash() {
        this.slashActive = true;
        this.slashTimer = 15;
        this.slashCooldown = 60;

        const reach = 70;
        const hitX = this.facingRight ? this.x + this.w : this.x - reach;

        
        spawnParticles(hitX + reach / 2, this.y + this.h / 2, "white", 5, 'spark');

        if (!(this.target || redCube).dead && rectIntersect(hitX, this.y, reach, this.h, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
            if (!(this.target || redCube).isInvincible) {
                
                (this.target || redCube).takeDamage(20 * this.damageMult);
                (this.target || redCube).vx = this.facingRight ? 10 : -10;
                (this.target || redCube).vy = -5;
                
                if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
            }
        } else {
            
            sessionStats.womboComboActive = false;
        }
    }

    draw(ctx) {
        super.draw(ctx);
        if (this.dead) return;
        if (isRetroMode) return; 

        if (this.slashActive) {
            ctx.fillStyle = "rgba(128, 0, 128, 0.6)";
            const reach = 70;
            const hitX = this.facingRight ? this.x + this.w : this.x - reach;

            
            ctx.beginPath();
            if (this.facingRight) {
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, reach, -Math.PI / 2, Math.PI / 2);
            } else {
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, reach, Math.PI / 2, -Math.PI / 2);
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 5;
            ctx.stroke();

            ctx.fillRect(hitX, this.y, reach, this.h);
        }

        if (this.parryActive) {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 40, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}


class GreenCube extends BlueCube {
    constructor() {
        super();
        this.color = "green";
        this.baseColor = "green";
        this.beamState = 'IDLE'; 
        this.beamTimer = 0;
    }

    update() {
        super.update(); 
        if (this.dead) return;
        if (isRetroMode) return; 

        if (this.beamState !== 'IDLE') {
            this.vx = 0;
            this.beamTimer--;

            if (this.beamState === 'WINDUP') {
                this.color = (Math.floor(Date.now() / 100) % 2 === 0) ? "green" : "white";

                
                if (Math.random() < 0.5) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 60;
                    const px = this.x + this.w / 2 + Math.cos(angle) * dist;
                    const py = this.y + this.h / 2 + Math.sin(angle) * dist;
                    const p = new Particle(px, py, "#00FF00", 0, 10, 'beam_charge');
                    p.vx = (this.x + this.w / 2 - px) * 0.1;
                    p.vy = (this.y + this.h / 2 - py) * 0.1;
                    particles.push(p);
                }

                if (this.beamTimer <= 0) {
                    this.beamState = 'FIRING';
                    this.beamTimer = 15;
                    this.fireBeam();
                }
            } else if (this.beamState === 'FIRING') {
                this.color = "green";
                if (this.beamTimer <= 0) this.beamState = 'IDLE';
            }
        } else {
            if (keys['KeyF']) {
                this.beamState = 'WINDUP';
                this.beamTimer = 40;
            }
        }
    }

    fireBeam() {
        const beamW = 600;
        const beamH = 30;
        const beamX = this.facingRight ? this.x + this.w : this.x - beamW;
        const beamY = this.y + 15;

        triggerShake(10);
        spawnParticles(this.x + this.w / 2, this.y + this.h / 2, "#00FF00", 20, 'spark');

        if (rectIntersect(beamX, beamY, beamW, beamH, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
            spawnParticles((this.target || redCube).x + (this.target || redCube).w / 2, (this.target || redCube).y + (this.target || redCube).h / 2, "#00FF00", 15, 'spark');
            (this.target || redCube).takeDamage(20 * this.damageMult);
            (this.target || redCube).vx = this.facingRight ? 15 : -15;
            if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
        } else {
            sessionStats.womboComboActive = false;
        }
    }

    draw(ctx) {
        super.draw(ctx);
        if (isRetroMode) return;

        if (this.beamState === 'FIRING') {
            ctx.fillStyle = "#00FF00";
            const beamW = 600;
            const beamX = this.facingRight ? this.x + this.w : this.x - beamW;

            
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#00FF00";
            ctx.fillRect(beamX, this.y + 15, beamW, 30);

            
            ctx.fillStyle = "white";
            ctx.fillRect(beamX, this.y + 22, beamW, 16);

            ctx.shadowBlur = 0;
        }
    }
}


class PinkCube extends BlueCube {
    constructor() {
        super();
        this.color = "hotpink";
        this.baseColor = "hotpink";
        this.blockEnergy = 100;
        this.isBlocking = false;
    }

    update() {
        if (isRetroMode) {
            super.update();
            return;
        }
        
        if (IS_TESTER) this.blockEnergy = 100;
        if (!this.isBlocking && this.blockEnergy < 100) this.blockEnergy += 0.5;

        
        if (keys['KeyF'] && this.blockEnergy > 0) {
            this.isBlocking = true;
            this.blockEnergy -= 2.0;
            this.vx = 0;
            this.color = "#FFC0CB";
            
        } else {
            this.isBlocking = false;
            this.color = this.baseColor;
            super.update(); 
        }
    }

    takeDamage(amount) {
        if (this.isBlocking) {
            
            this.blockEnergy -= 20;
            spawnParticles(this.x + this.w / 2, this.y + this.h / 2, "cyan", 5, 'spark');
            if (this.blockEnergy < 0) this.blockEnergy = 0;
        } else {
            super.takeDamage(amount);
        }
    }

    draw(ctx) {
        super.draw(ctx);
        if (isRetroMode) return;
        
        ctx.fillStyle = "#333";
        ctx.fillRect(this.x, this.y - 15, this.w, 8);
        ctx.fillStyle = "cyan";
        ctx.fillRect(this.x, this.y - 15, this.w * (this.blockEnergy / 100), 8);

        if (this.isBlocking) {
            ctx.strokeStyle = "cyan";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 45, 0, Math.PI * 2);
            ctx.stroke();

            
            ctx.strokeStyle = `rgba(0, 255, 255, ${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 50 + Math.random() * 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}


class BrownCube extends BlueCube {
    constructor() {
        super();
        this.maxHp = 75;
        this.hp = 75;
        this.color = "#8B4513";
        this.baseColor = "#8B4513";
        this.beamState = 'IDLE';
        this.beamTimer = 0;
    }

    update() {
        if (isRetroMode) {
            super.update();
            return;
        }
        
        if (this.beamState !== 'IDLE') {
            this.vx = 0;
            this.beamTimer--;
            if (this.beamState === 'WINDUP') {
                this.color = (Math.floor(Date.now() / 100) % 2 === 0) ? this.baseColor : "yellow";
                if (this.beamTimer <= 0) {
                    this.beamState = 'FIRING';
                    this.beamTimer = 15;
                    this.fireBeam();
                }
            } else if (this.beamState === 'FIRING') {
                this.color = this.baseColor;
                if (this.beamTimer <= 0) this.beamState = 'IDLE';
            }
            return;
        }

        if (keys['KeyF'] && this.beamState === 'IDLE') {
            this.beamState = 'WINDUP';
            this.beamTimer = 40;
        }

        
        super.update();
    }

    
    performSlash() {
        this.slashActive = true;
        this.slashTimer = 10;
        this.slashCooldown = 50;

        const reach = 60;
        const hitX = this.facingRight ? this.x + this.w : this.x - reach;

        if (rectIntersect(hitX, this.y + 20, reach, 30, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
            (this.target || redCube).takeDamage(15 * this.damageMult);
            
            (this.target || redCube).vx = this.facingRight ? 25 : -25;
            (this.target || redCube).vy = -10;
            (this.target || redCube).state = 'STUNNED'; 
            (this.target || redCube).stateTimer = 20;
            spawnParticles((this.target || redCube).x + (this.target || redCube).w / 2, (this.target || redCube).y + (this.target || redCube).h / 2, "yellow", 10, 'spark');
            triggerShake(8);
            if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
        } else {
            sessionStats.womboComboActive = false;
        }
    }

    fireBeam() {
        const beamW = 600;
        const beamX = this.facingRight ? this.x + this.w : this.x - beamW;
        triggerShake(10);
        if (rectIntersect(beamX, this.y + 15, beamW, 30, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
            (this.target || redCube).takeDamage(20 * this.damageMult);
            spawnParticles((this.target || redCube).x + (this.target || redCube).w / 2, (this.target || redCube).y + (this.target || redCube).h / 2, "yellow", 10, 'spark');
            if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
        } else {
            sessionStats.womboComboActive = false;
        }
    }

    draw(ctx) {
        super.draw(ctx);
        if (isRetroMode) return;
        if (this.beamState === 'FIRING') {
            ctx.fillStyle = "yellow";
            const beamW = 600;
            const beamX = this.facingRight ? this.x + this.w : this.x - beamW;

            ctx.shadowBlur = 15;
            ctx.shadowColor = "yellow";
            ctx.fillRect(beamX, this.y + 15, beamW, 30);

            ctx.fillStyle = "white";
            ctx.fillRect(beamX, this.y + 22, beamW, 16);

            ctx.shadowBlur = 0;
        }
    }
}


class PurpleCube extends BlueCube {
    constructor() {
        super();
        this.maxHp = 75;
        this.hp = 75;
        this.color = "indigo";
        this.baseColor = "indigo";
        this.pullActive = false;
        this.pullTimer = 0;
        this.pullCooldown = 0;
        this.pullWindup = 0; 
    }

    update() {
        if (isRetroMode) {
            super.update();
            return;
        }
        if (IS_TESTER) this.pullCooldown = 0;
        if (this.pullCooldown > 0) this.pullCooldown--;

        
        if (this.pullWindup > 0) {
            this.pullWindup--;
            this.vx = 0;
            this.color = (Math.floor(Date.now() / 50) % 2 === 0) ? "purple" : "indigo";
            if (this.pullWindup <= 0) {
                this.executePull();
            }
            return;
        }

        if (this.pullActive) {
            this.pullTimer--;
            this.vx = 0;

            
            const dx = this.x - (this.target || redCube).x;
            const dist = Math.abs(dx);

            
            if (dist < 500) {
                (this.target || redCube).vx = (dx > 0) ? 8 : -8;

                
                
                if (dist < 80) {
                    (this.target || redCube).invertControlsTimer = 180;
                }
            }

            if (this.pullTimer <= 0) this.pullActive = false;
            return;
        }

        
        if (keys['KeyF'] && this.pullCooldown <= 0 && this.pullWindup <= 0 && !this.pullActive) {
            this.pullWindup = 20; 
        }

        super.update();
    }

    executePull() {
        this.pullActive = true;
        this.pullTimer = 30;
        this.pullCooldown = 120;
        this.color = "purple";
    }

    draw(ctx) {
        super.draw(ctx);
        if (isRetroMode) return;

        
        if (this.pullWindup > 0) {
            ctx.strokeStyle = "rgba(128, 0, 128, 0.5)";
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 100 - this.pullWindup * 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.pullActive) {
            ctx.strokeStyle = "purple";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(this.x + this.w / 2, this.y + this.h / 2);
            ctx.lineTo((this.target || redCube).x + (this.target || redCube).w / 2, (this.target || redCube).y + (this.target || redCube).h / 2);
            ctx.stroke();

            
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.w / 2, this.y + this.h / 2);
            const midX = (this.x + (this.target || redCube).x) / 2 + (Math.random() - 0.5) * 50;
            const midY = (this.y + (this.target || redCube).y) / 2 + (Math.random() - 0.5) * 50;
            ctx.lineTo(midX, midY);
            ctx.lineTo((this.target || redCube).x + (this.target || redCube).w / 2, (this.target || redCube).y + (this.target || redCube).h / 2);
            ctx.stroke();
        }
    }
}


class VigilanteCube extends BlueCube {
    constructor() {
        super();
        this.color = "#2F4F4F";
        this.baseColor = "#2F4F4F";
        this.maxHp = 125;
        this.hp = 125;

        
        this.dashActive = false;
        this.dashTimer = 0;
        this.dashHit = false; 

        
        this.droneActive = false;
        this.droneTimer = 0;
        this.droneCooldown = 0;
        this.droneX = this.x;
        this.droneY = this.y - 100;
        this.droneFireTimer = 0;
    }

    update() {
        if (this.dead) return;
        if (isRetroMode) {
            super.update();
            return;
        }

        
        if (IS_TESTER) {
            this.slashCooldown = 0;
            this.droneCooldown = 0;
        }
        if (this.slashCooldown > 0) this.slashCooldown--;
        if (this.droneCooldown > 0) this.droneCooldown--;

        
        if (this.droneActive) {
            this.droneTimer--;

            
            let targetX = (this.target || redCube).x;
            let targetY = (this.target || redCube).y - 150;

            
            this.droneX += (targetX - this.droneX) * 0.1;
            this.droneY += (targetY - this.droneY) * 0.1;

            
            this.droneFireTimer--;
            if (this.droneFireTimer <= 0) {
                this.droneFireTimer = 60; 
                
                if (Math.abs(this.droneX - (this.target || redCube).x) < 50) {
                    (this.target || redCube).takeDamage(5);
                    spawnParticles((this.target || redCube).x + (this.target || redCube).w / 2, (this.target || redCube).y, "cyan", 5, 'spark');
                }
            }

            if (this.droneTimer <= 0) {
                this.droneActive = false;
                this.droneCooldown = 900; 
            }
        }

        
        
        if (keys['Space'] && this.slashCooldown <= 0 && !this.dashActive) {
            this.performSlash();
        }

        
        if (keys['KeyF'] && !this.droneActive && this.droneCooldown <= 0) {
            this.droneActive = true;
            this.droneTimer = 480; 
            this.droneX = this.x; 
            this.droneY = this.y - 50;
            this.droneFireTimer = 30;
        }

        
        if (this.dashActive) {
            this.vx = this.facingRight ? 20 : -20; 
            this.dashTimer--;

            
            if (this.isGrounded) {
                spawnParticles(this.x + this.w / 2, this.y + this.h, "#555", 1, 'square');
            }

            
            if (rectIntersect(this.x, this.y, this.w, this.h, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
                (this.target || redCube).takeDamage(15);
                (this.target || redCube).vx = this.facingRight ? 15 : -15; 
                (this.target || redCube).vy = -5;
                triggerShake(8);

                
                this.dashActive = false;
                this.vx = this.facingRight ? -5 : 5; 
                this.dashHit = true;

                if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
            }

            if (this.dashTimer <= 0) {
                this.dashActive = false;
                
                if (!this.dashHit) {
                    sessionStats.womboComboActive = false;
                }
            }

            
            this.vy += GRAVITY;
            this.x += this.vx;
            this.y += this.vy;
            if (this.y + this.h >= FLOOR_Y) {
                this.y = FLOOR_Y - this.h;
                this.vy = 0;
                this.isGrounded = true;
            }
        } else {
            super.update(); 
        }
    }

    performSlash() {
        
        this.dashActive = true;
        this.dashTimer = 15; 
        this.slashCooldown = 60; 
        this.dashHit = false; 
    }

    draw(ctx) {
        super.draw(ctx);
        if (isRetroMode) return;

        
        if (this.dashActive) {
            ctx.fillStyle = "rgba(47, 79, 79, 0.5)";
            ctx.fillRect(this.x - (this.facingRight ? 20 : -20), this.y, this.w, this.h);
        }

        
        if (this.droneActive) {
            
            ctx.fillStyle = "#00FFFF";
            ctx.fillRect(this.droneX, this.droneY, 30, 10);
            ctx.fillStyle = "white";
            ctx.fillRect(this.droneX + 10, this.droneY - 5, 10, 5); 

            
            if (this.droneFireTimer > 55) { 
                ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
                ctx.fillRect(this.droneX + 14, this.droneY + 10, 2, (this.target || redCube).y - this.droneY);

                
                ctx.beginPath();
                ctx.arc(this.droneX + 15, this.droneY + 10, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            
            ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
            ctx.beginPath();
            ctx.moveTo(this.x + this.w / 2, this.y);
            ctx.lineTo(this.droneX + 15, this.droneY + 10);
            ctx.stroke();
        }
    }
}


class AngrySniperCube extends BlueCube {
    constructor() {
        super();
        this.color = "red";
        this.baseColor = "red";
        this.dashActive = false;
        this.dashTimer = 0;
        this.dashWindup = 0; 
        this.dashCooldown = 0; 
        this.dashHit = false;
        this.beamState = 'IDLE';
        this.beamTimer = 0;
    }

    update() {
        if (this.dead) return;

        
        if (IS_TESTER) this.dashCooldown = 0;
        if (this.dashCooldown > 0) this.dashCooldown--;

        if (isRetroMode) {
            super.update();
            return;
        }

        
        if (this.beamState !== 'IDLE') {
            this.vx = 0; 
            this.beamTimer--;

            if (this.beamState === 'WINDUP') {
                this.color = (Math.floor(Date.now() / 100) % 2 === 0) ? "cyan" : "black";
                
                if (Math.random() < 0.5) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 60;
                    const px = this.x + this.w / 2 + Math.cos(angle) * dist;
                    const py = this.y + this.h / 2 + Math.sin(angle) * dist;
                    const p = new Particle(px, py, "red", 0, 10, 'beam_charge');
                    p.vx = (this.x + this.w / 2 - px) * 0.1;
                    p.vy = (this.y + this.h / 2 - py) * 0.1;
                    particles.push(p);
                }
                if (this.beamTimer <= 0) {
                    this.beamState = 'FIRING';
                    this.beamTimer = 20;
                    this.fireBeam();
                }
            } else if (this.beamState === 'FIRING') {
                this.color = "red";
                if (this.beamTimer <= 0) {
                    this.beamState = 'IDLE';
                }
            }
            return; 
        }

        
        if (this.dashWindup > 0) {
            this.dashWindup--;
            this.vx = 0; 
            this.color = (Math.floor(Date.now() / 50) % 2 === 0) ? "#500000" : "red"; 

            if (this.dashWindup <= 0) {
                this.executeDash();
            }
            return;
        }

        
        if (this.dashActive) {
            this.dashTimer--;
            this.vx = this.facingRight ? 20 : -20;

            
            if (this.isGrounded) {
                spawnParticles(this.x + this.w / 2, this.y + this.h, "#555", 1, 'square');
            }

            
            if (rectIntersect(this.x, this.y, this.w, this.h, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
                (this.target || redCube).takeDamage(15 * this.damageMult); 
                (this.target || redCube).vx = this.facingRight ? 15 : -15;
                (this.target || redCube).vy = -5;
                this.dashActive = false; 
                this.vx = this.facingRight ? -5 : 5; 
                this.dashHit = true;
                triggerShake(5);
                if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
            }

            if (this.dashTimer <= 0) {
                this.dashActive = false;
                this.vx = 0;
                if (!this.dashHit) {
                    sessionStats.womboComboActive = false;
                }
            }

            
            this.vy += GRAVITY;
            this.y += this.vy;
            if (this.y + this.h >= FLOOR_Y) {
                this.y = FLOOR_Y - this.h;
                this.vy = 0;
                this.isGrounded = true;
            }
            this.x += this.vx;
            if (this.x < 0) this.x = 0;
            if (this.x + this.w > WIDTH) this.x = WIDTH - this.w;
            return; 
        }

        
        if (keys['KeyF']) {
            this.beamState = 'WINDUP';
            this.beamTimer = 50;
            return;
        }

        
        super.update();
    }

    
    performSlash() {
        if (!this.dashActive && this.dashWindup <= 0 && this.dashCooldown <= 0) {
            this.dashWindup = 15; 
            
            spawnParticles(this.x + this.w / 2, this.y + this.h / 2, "#FF4444", 5, 'spark');
        }
    }

    executeDash() {
        this.dashActive = true;
        this.dashTimer = 15;
        this.dashCooldown = 90; 
        this.dashHit = false;
        this.color = "red";
        
        spawnParticles(this.x + (this.facingRight ? 0 : this.w), this.y + this.h / 2, "white", 10, 'spark');
    }

    fireBeam() {
        const beamW = 600;
        const beamH = 40;
        const beamX = this.facingRight ? this.x + this.w : this.x - beamW;
        const beamY = this.y + (this.h / 2) - (beamH / 2);

        triggerShake(8);
        spawnParticles(this.x + this.w / 2, this.y + this.h / 2, "cyan", 15, 'spark');

        if (rectIntersect(beamX, beamY, beamW, beamH, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
            (this.target || redCube).takeDamage(25 * this.damageMult); 
            if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
        } else {
            sessionStats.womboComboActive = false;
        }
    }

    takeDamage(amount) {
        if (this.dashActive) return; 
        super.takeDamage(amount);
    }

    draw(ctx) {
        super.draw(ctx);
        if (isRetroMode) return;

        
        if (this.dashWindup > 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeStyle = "white";
            ctx.strokeRect(this.x - 5, this.y - 5, this.w + 10, this.h + 10);
        }

        
        if (this.dashActive) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(this.x - (this.facingRight ? 20 : -20), this.y, this.w, this.h);
        }

        
        if (this.beamState === 'FIRING') {
            ctx.fillStyle = "cyan";
            const beamW = 600;
            const beamH = 40;
            const beamX = this.facingRight ? this.x + this.w : this.x - beamW;
            const beamY = this.y + (this.h / 2) - (beamH / 2);

            ctx.shadowColor = "cyan";
            ctx.shadowBlur = 20;
            ctx.fillRect(beamX, beamY, beamW, beamH);

            ctx.fillStyle = "white";
            ctx.fillRect(beamX, beamY + 15, beamW, 10);

            ctx.shadowBlur = 0;
        }

        
        if (this.dashCooldown > 0) {
            ctx.fillStyle = "gray";
            ctx.font = "12px Arial";
            ctx.fillText(Math.ceil(this.dashCooldown / 60), this.x + 15, this.y - 10);
        }
    }
}


class Fbt7Cube extends BlueCube {
    constructor() {
        super();
        this.color = "black";
        this.baseColor = "black";
        this.hp = 200;
        this.maxHp = 200;

        
        this.deleteSlashActive = false;
        this.deleteSlashTimer = 0;
        this.deleteCooldown = 0;
        this.poisonTargets = [];

        
        this.error404Active = false;
        this.error404Timer = 0;
        this.error404Cooldown = 0;
        this.clone = null;

        
        this.hatredActive = false;
        this.hatredTimer = 0;
        this.hatredCooldown = 0;
        this.originalSpeed = MOVE_SPEED;

        
        this.terminationCooldown = 0;
    }

    update() {
        if (this.dead) return;

        
        
        if (IS_TESTER) {
            this.deleteCooldown = 0;
            this.error404Cooldown = 0;
            this.hatredCooldown = 0;
            this.terminationCooldown = 0;
        }
        if (this.deleteCooldown > 0) this.deleteCooldown--;
        if (this.error404Cooldown > 0) this.error404Cooldown--;
        if (this.hatredCooldown > 0) this.hatredCooldown--;
        if (this.terminationCooldown > 0) this.terminationCooldown--;

        
        
        if (isRetroMode) {
            super.update();
            return;
        }

        
        this.processPoisonDamage();

        
        if (this.hatredActive) {
            this.hatredTimer--;
            this.color = (Math.floor(Date.now() / 80) % 2 === 0) ? "#8B0000" : "black";
            this.damageMult = 2.0;

            
            if (Math.random() < 0.2) {
                spawnParticles(this.x + Math.random() * this.w, this.y + Math.random() * this.h, "red", 1, 'spark');
            }

            if (this.hatredTimer <= 0) {
                this.hatredActive = false;
                this.color = this.baseColor;
                this.damageMult = 1.0;
                this.hatredCooldown = 600;
            }
        }

        
        if (this.error404Active) {
            this.error404Timer--;
            if (redCube && !(this.target || redCube).dead) {
                (this.target || redCube).stateTimer += 0.5;
            }

            if (this.error404Timer <= 0) {
                this.error404Active = false;
                if (this.clone) {
                    this.clone = null;
                }
                this.error404Cooldown = 480;
            }
        }

        if (this.clone) {
            this.updateClone();
        }

        if (this.deleteSlashActive) {
            this.deleteSlashTimer--;
            if (this.deleteSlashTimer <= 0) {
                this.deleteSlashActive = false;
            }
        }

        
        if (keys['Space'] && this.deleteCooldown <= 0 && !this.deleteSlashActive) {
            this.performDeleteSlash();
        }

        
        if (keys['KeyF'] && this.error404Cooldown <= 0 && !this.error404Active) {
            this.performError404();
        }

        
        if (keys['KeyQ'] && this.hatredCooldown <= 0 && !this.hatredActive) {
            this.activateHatred();
        }

        
        if (keys['KeyE'] && this.terminationCooldown <= 0) {
            this.performTermination();
        }

        
        let inputLeft = keys['KeyA'];
        let inputRight = keys['KeyD'];

        if (this.invertControlsTimer > 0) {
            const temp = inputLeft;
            inputLeft = inputRight;
            inputRight = temp;
        }

        const currentSpeed = this.hatredActive ? MOVE_SPEED * 1.8 : MOVE_SPEED;

        if (inputLeft) {
            this.vx = -currentSpeed;
            this.facingRight = false;
        }
        if (inputRight) {
            this.vx = currentSpeed;
            this.facingRight = true;
        }
        if (keys['KeyW'] && this.isGrounded) {
            this.vy = this.hatredActive ? -JUMP_FORCE * 1.2 : -JUMP_FORCE;
        }

        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        if (this.y + this.h >= FLOOR_Y) {
            this.y = FLOOR_Y - this.h;
            this.vy = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        if (this.x < 0) this.x = 0;
        if (this.x + this.w > WIDTH) this.x = WIDTH - this.w;

        this.vx *= FRICTION;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    performDeleteSlash() {
        this.deleteSlashActive = true;
        this.deleteSlashTimer = 20;
        this.deleteCooldown = 90;

        const reach = 120;
        const hitX = this.facingRight ? this.x + this.w : this.x - reach;

        
        spawnParticles(hitX + reach / 2, this.y + this.h / 2, "#00FF00", 20, 'bubble');

        if (!(this.target || redCube).dead && rectIntersect(hitX, this.y - 20, reach, this.h + 40, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
            if (!(this.target || redCube).isInvincible) {
                (this.target || redCube).takeDamage(15 * this.damageMult);
                (this.target || redCube).vx = this.facingRight ? 12 : -12;
                (this.target || redCube).vy = -8;

                this.poisonTargets.push({
                    target: redCube,
                    ticksRemaining: 5,
                    tickTimer: 60
                });
                if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
            }
        } else {
            sessionStats.womboComboActive = false;
        }
    }

    processPoisonDamage() {
        for (let i = this.poisonTargets.length - 1; i >= 0; i--) {
            const poison = this.poisonTargets[i];
            poison.tickTimer--;

            
            if (Math.random() < 0.1) {
                spawnParticles(poison.target.x + poison.target.w / 2, poison.target.y, "#00FF00", 1, 'bubble');
            }

            if (poison.tickTimer <= 0) {
                poison.tickTimer = 60;
                poison.ticksRemaining--;

                if (!poison.target.dead) {
                    poison.target.takeDamage(8);
                    poison.target.color = "#00FF00";
                    setTimeout(() => {
                        if (!poison.target.dead) {
                            poison.target.color = poison.target.baseColor || COLORS.RED;
                        }
                    }, 100);
                }

                if (poison.ticksRemaining <= 0) {
                    this.poisonTargets.splice(i, 1);
                }
            }
        }
    }

    performError404() {
        this.error404Active = true;
        this.error404Timer = 180;
        this.error404Cooldown = 480;

        if (!(this.target || redCube).dead) {
            (this.target || redCube).invertControlsTimer = 180;
            (this.target || redCube).state = 'STUNNED';
            (this.target || redCube).stateTimer = 30;
            triggerShake(5);
        }

        if (Math.random() < 0.4) {
            this.spawnClone();
        }
    }

    spawnClone() {
        this.clone = {
            x: this.facingRight ? this.x - 60 : this.x + 60,
            y: this.y,
            w: this.w,
            h: this.h,
            facingRight: this.facingRight,
            hp: 50,
            dead: false,
            attackTimer: 60,
            alpha: 0.6
        };
    }

    updateClone() {
        if (!this.clone || this.clone.dead) return;

        const dx = (this.target || redCube).x - this.clone.x;
        if (Math.abs(dx) > 100) {
            this.clone.x += dx > 0 ? 3 : -3;
            this.clone.facingRight = dx > 0;
        }

        this.clone.attackTimer--;
        if (this.clone.attackTimer <= 0) {
            this.clone.attackTimer = 90;
            const reach = 70;
            const hitX = this.clone.facingRight ? this.clone.x + this.clone.w : this.clone.x - reach;

            if (!(this.target || redCube).dead && rectIntersect(hitX, this.clone.y, reach, this.clone.h, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
                (this.target || redCube).takeDamage(10);
            }
        }

        if (!this.error404Active) {
            this.clone = null;
        }
    }

    activateHatred() {
        this.hatredActive = true;
        this.hatredTimer = 300;
        this.hatredCooldown = 600;
        triggerShake(5);
        spawnParticles(this.x + this.w / 2, this.y + this.h / 2, "red", 30, 'spark');
    }

    
    performTermination() {
        this.terminationCooldown = 1200; 

        
        triggerShatter();
        triggerShake(20);

        
        
        
        const phase1 = 1000; 
        const retroDur = 2000;
        const normalDur = 1000;

        let time = phase1;

        
        setTimeout(() => { isRetroMode = true; }, time);
        time += retroDur;

        
        setTimeout(() => { isRetroMode = false; triggerShatter(); }, time);
        time += normalDur;

        
        setTimeout(() => { isRetroMode = true; }, time);
        time += retroDur;

        
        setTimeout(() => { isRetroMode = false; triggerShatter(); }, time);
        time += normalDur;

        
        setTimeout(() => { isRetroMode = true; }, time);
        time += retroDur;

        
        setTimeout(() => { isRetroMode = false; triggerShatter(); }, time);
        time += normalDur;

        
        setTimeout(() => { isRetroMode = true; }, time);
        time += retroDur;

        
        setTimeout(() => { isRetroMode = false; triggerShatter(); }, time);
    }

    draw(ctx) {
        if (this.dead) return;
        if (isRetroMode) {
            
            ctx.fillStyle = "black";
            ctx.fillRect(this.x, this.y, this.w, this.h);
            return;
        }

        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        
        if (this.hatredActive) {
            ctx.shadowColor = "#FF0000";
            ctx.shadowBlur = 20;
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
            ctx.shadowBlur = 0;
        } else {
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        }

        
        ctx.fillStyle = this.hatredActive ? "#FF0000" : "#00FF00";
        const eyeX = this.facingRight ? this.x + 30 : this.x + 10;
        ctx.fillRect(eyeX, this.y + 10, 10, 10);

        
        if (this.deleteSlashActive) {
            const reach = 120;
            const hitX = this.facingRight ? this.x + this.w : this.x - reach;

            
            ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
            ctx.fillRect(hitX, this.y - 20, reach, this.h + 40);

            
            for (let i = 0; i < 5; i++) {
                ctx.fillStyle = "rgba(0, 180, 0, 0.8)";
                ctx.beginPath();
                ctx.arc(hitX + Math.random() * reach, this.y + this.h + Math.random() * 20, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        
        if (this.error404Active) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.font = "bold 16px monospace";
            ctx.fillText("ERROR 404", this.x - 10, this.y - 30);

            
            for (let i = 0; i < 3; i++) {
                ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 - i * 0.1})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x + Math.random() * this.w, this.y);
                ctx.lineTo(this.x + Math.random() * this.w, this.y + this.h);
                ctx.stroke();
            }
        }

        
        if (this.clone && !this.clone.dead) {
            ctx.globalAlpha = this.clone.alpha;
            ctx.fillStyle = "black";
            ctx.fillRect(this.clone.x, this.clone.y, this.clone.w, this.clone.h);
            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.clone.x, this.clone.y, this.clone.w, this.clone.h);

            
            ctx.fillStyle = "#00FF00";
            const cloneEyeX = this.clone.facingRight ? this.clone.x + 30 : this.clone.x + 10;
            ctx.fillRect(cloneEyeX, this.clone.y + 10, 10, 10);
            ctx.globalAlpha = 1.0;
        }

        
        ctx.font = "10px Arial";
        ctx.textAlign = "left";
        let indicatorY = this.y - 45;

        
        ctx.fillStyle = this.deleteCooldown > 0 ? "#666" : "#00FF00";
        ctx.fillText(`[SPACE] DELETE ${this.deleteCooldown > 0 ? Math.ceil(this.deleteCooldown / 60) + 's' : 'READY'}`, this.x - 20, indicatorY);
        indicatorY += 12;

        
        ctx.fillStyle = this.error404Cooldown > 0 ? "#666" : "#FF0000";
        ctx.fillText(`[F] 404 ${this.error404Active ? 'ACTIVE' : (this.error404Cooldown > 0 ? Math.ceil(this.error404Cooldown / 60) + 's' : 'READY')}`, this.x - 20, indicatorY);
        indicatorY += 12;

        
        ctx.fillStyle = this.hatredCooldown > 0 ? "#666" : "#8B0000";
        ctx.fillText(`[Q] HATRED ${this.hatredActive ? 'ACTIVE' : (this.hatredCooldown > 0 ? Math.ceil(this.hatredCooldown / 60) + 's' : 'READY')}`, this.x - 20, indicatorY);
        indicatorY += 12;

        
        ctx.fillStyle = this.terminationCooldown > 0 ? "#666" : "#000000";
        ctx.fillText(`[E] TERMINATION ${this.terminationCooldown > 0 ? Math.ceil(this.terminationCooldown / 60) + 's' : 'READY'}`, this.x - 20, indicatorY);
    }
}


function triggerShatter() {
    shatterActive = true;
    shatterShards = [];

    
    for (let i = 0; i < 30; i++) {
        shatterShards.push({
            x: WIDTH / 2,
            y: HEIGHT / 2,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            w: Math.random() * 50 + 20,
            h: Math.random() * 50 + 20,
            angle: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.5,
            color: Math.random() > 0.5 ? '#333' : '#111',
            alpha: 1.0
        });
    }

    
    setTimeout(() => { shatterActive = false; }, 800);
}


class GoldCube extends BlueCube {
    constructor() {
        super();
        this.color = "#FFD700";
        this.baseColor = "#FFD700";
        this.masterState = 'MASTER'; 
        this.minion = null;
        this.swapTargetX = -150;

        
        this.overtimeActive = false;
        this.overtimeTimer = 0;
        this.overtimeCooldown = 0;
    }

    update() {
        if (this.dead) return;
        if (isRetroMode) {
            
            if (this.masterState === 'MINION_MODE' && this.minion) {
                this.minion.update();
                this.x = this.minion.x;
                this.y = this.minion.y;
            } else {
                super.update();
            }
            return;
        }

        
        if (this.overtimeActive) {
            this.overtimeTimer--;
            if (this.overtimeTimer <= 0) {
                this.overtimeActive = false;
                document.getElementById('overtime-overlay').classList.remove('active');
                this.overtimeCooldown = 300; 
            }
        } else {
            if (IS_TESTER) this.overtimeCooldown = 0;
            if (this.overtimeCooldown > 0) this.overtimeCooldown--;
        }

        
        if (this.masterState === 'MASTER') {
            super.update(); 

            
            if (keys['Space'] && !this.overtimeActive && this.overtimeCooldown <= 0) {
                this.overtimeActive = true;
                this.overtimeTimer = 300; 
                document.getElementById('overtime-overlay').classList.add('active');
            }

            
            if (keys['KeyF']) {
                this.masterState = 'SWAPPING_OUT';
            }
        }
        
        else if (this.masterState === 'SWAPPING_OUT') {
            this.vx = -15; 
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -100) {
                this.spawnMinion();
                this.masterState = 'MINION_MODE';
                this.vx = 0;
            }
        }
        
        else if (this.masterState === 'MINION_MODE') {
            if (this.minion) {
                this.minion.update();

                
                if (this.overtimeActive) {
                    if (this.minion.slashCooldown > 0) this.minion.slashCooldown--;
                    if (this.minion.parryCooldown > 0) this.minion.parryCooldown--;
                    if (this.minion.beamTimer > 0 && this.minion.beamState !== 'FIRING') this.minion.beamTimer--;
                    if (this.minion.pullCooldown > 0) this.minion.pullCooldown--;
                    if (this.minion.blockEnergy < 100 && !this.minion.isBlocking) this.minion.blockEnergy += 0.5;
                    if (this.minion.droneCooldown > 0) this.minion.droneCooldown--;
                }

                
                this.x = this.minion.x;
                this.y = this.minion.y;

                if (this.minion.dead) {
                    this.minion = null;
                    this.masterState = 'SWAPPING_IN';
                    
                    this.x = -100;
                    this.y = FLOOR_Y - this.h;
                }
            }
        }
        
        else if (this.masterState === 'SWAPPING_IN') {
            this.vx = 15;
            this.x += this.vx;
            if (this.y + this.h >= FLOOR_Y) this.y = FLOOR_Y - this.h;

            if (this.x >= 50) { 
                this.masterState = 'MASTER';
                this.vx = 0;
            }
        }
    }

    spawnMinion() {
        
        
        const types = [BlueCube, GreenCube, PinkCube, BrownCube, PurpleCube, VigilanteCube, AngrySniperCube];
        const RandomClass = types[Math.floor(Math.random() * types.length)];

        this.minion = new RandomClass();
        this.minion.x = -50; 
        this.minion.y = FLOOR_Y - CUBE_SIZE;
        this.minion.vx = 20; 
        this.minion.vy = -10;

        
        this.minion.maxHp = 50;
        this.minion.hp = 50;
        this.minion.damageMult = 0.5;

        spawnParticles(this.minion.x, this.minion.y, "white", 10, 'square'); 

        
        if (this.overtimeActive) {
            this.minion.maxHp = 100;
            this.minion.hp = 100;
            this.minion.damageMult = 1.0;
            this.minion.baseColor = this.minion.color;
        }
    }

    takeDamage(amount) {
        if (this.masterState === 'MINION_MODE' && this.minion) {
            this.minion.takeDamage(amount);
        } else if (this.masterState === 'MASTER' || this.masterState === 'SWAPPING_IN') {
            super.takeDamage(amount);
        }
    }

    draw(ctx) {
        if (this.dead) return;
        if (isRetroMode) {
            if (this.masterState === 'MINION_MODE' && this.minion) this.minion.draw(ctx);
            else super.draw(ctx);
            return;
        }

        if (this.masterState === 'MINION_MODE' && this.minion) {
            this.minion.draw(ctx);
        } else {
            super.draw(ctx);

            
            if (this.masterState === 'MASTER') {
                if (this.overtimeActive) {
                    ctx.fillStyle = "#FF00FF";
                    ctx.font = "bold 16px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText("OVERTIME!", this.x + this.w / 2, this.y - 20);
                } else if (this.overtimeCooldown > 0) {
                    ctx.fillStyle = "gray";
                    ctx.font = "14px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText(Math.ceil(this.overtimeCooldown / 60), this.x + this.w / 2, this.y - 20);
                } else {
                    ctx.fillStyle = "yellow";
                    ctx.font = "14px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText("Ready", this.x + this.w / 2, this.y - 20);
                }
            }
        }
    }
}


class Bobbythe124Cube extends BlueCube {
    constructor() {
        super();
        this.color = "#CCCCFF"; 
        this.baseColor = "#CCCCFF";
        this.maxHp = 149;
        this.hp = 149;

        
        this.jumpCount = 0;
        this.baseJumpForce = JUMP_FORCE;

        
        this.silenceCooldown = 0;
        this.silenceActive = false;
        this.silenceTimer = 0;

        
        this.hatredActive = false;
        this.hatredTimer = 0;
        this.hatredCooldown = 0;

        
        this.beamState = 'IDLE';
        this.beamTimer = 0;

        
        this.bleedCooldown = 0;
        this.bleedActive = false;
        this.bleedTimer = 0;
        this.poisonTargets = [];
    }

    update() {
        if (this.dead) return;

        
        
        if (IS_TESTER) {
            this.silenceCooldown = 0;
            this.hatredCooldown = 0;
            this.bleedCooldown = 0;
        }
        if (this.silenceCooldown > 0) this.silenceCooldown--;
        if (this.hatredCooldown > 0) this.hatredCooldown--;
        if (this.bleedCooldown > 0) this.bleedCooldown--;

        if (isRetroMode) {
            super.update();
            return;
        }

        
        this.processPoisonDamage();

        
        if (this.hatredActive) {
            this.hatredTimer--;
            this.color = (Math.floor(Date.now() / 80) % 2 === 0) ? "#8B0000" : this.baseColor;
            this.damageMult = 1.5;

            if (Math.random() < 0.2) {
                spawnParticles(this.x + Math.random() * this.w, this.y + Math.random() * this.h, "red", 1, 'spark');
            }

            if (this.hatredTimer <= 0) {
                this.hatredActive = false;
                this.color = this.baseColor;
                this.damageMult = 1.0;
                this.hatredCooldown = 480;
            }
        }

        
        if (this.beamState !== 'IDLE') {
            this.vx = 0;
            this.beamTimer--;

            if (this.beamState === 'WINDUP') {
                this.color = (Math.floor(Date.now() / 100) % 2 === 0) ? this.baseColor : "white";

                
                if (Math.random() < 0.5) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 60;
                    const px = this.x + this.w / 2 + Math.cos(angle) * dist;
                    const py = this.y + this.h / 2 + Math.sin(angle) * dist;
                    const p = new Particle(px, py, "#CCCCFF", 0, 10, 'beam_charge');
                    p.vx = (this.x + this.w / 2 - px) * 0.1;
                    p.vy = (this.y + this.h / 2 - py) * 0.1;
                    particles.push(p);
                }

                if (this.beamTimer <= 0) {
                    this.beamState = 'FIRING';
                    this.beamTimer = 15;
                    this.fireBeam();
                }
            } else if (this.beamState === 'FIRING') {
                if (!this.hatredActive) this.color = this.baseColor;
                if (this.beamTimer <= 0) this.beamState = 'IDLE';
            }
        }

        
        if (this.silenceActive) {
            this.silenceTimer--;
            if (this.silenceTimer <= 0) this.silenceActive = false;
        }

        if (this.bleedActive) {
            this.bleedTimer--;
            if (this.bleedTimer <= 0) this.bleedActive = false;
        }

        
        let inputLeft = keys['KeyA'];
        let inputRight = keys['KeyD'];

        if (this.invertControlsTimer > 0) {
            const temp = inputLeft;
            inputLeft = inputRight;
            inputRight = temp;
        }

        const currentSpeed = this.hatredActive ? MOVE_SPEED * 1.5 : MOVE_SPEED;

        if (inputLeft) {
            this.vx = -currentSpeed;
            this.facingRight = false;
        }
        if (inputRight) {
            this.vx = currentSpeed;
            this.facingRight = true;
        }

        
        if (keys['KeyW'] && this.isGrounded) {
            this.jumpCount++;
            const jumpBonus = Math.min(this.jumpCount * 1.5, 10); 
            this.vy = -(this.baseJumpForce + jumpBonus);
        }

        
        

        
        if (keys['Space'] && this.silenceCooldown <= 0 && this.beamState === 'IDLE') {
            this.performSilence();
        }

        
        if (keys['KeyQ'] && this.hatredCooldown <= 0 && !this.hatredActive) {
            this.activateHatred();
        }

        
        if (keys['KeyF'] && this.beamState === 'IDLE') {
            this.beamState = 'WINDUP';
            this.beamTimer = 40;
        }

        
        if (keys['KeyE'] && this.bleedCooldown <= 0 && this.beamState === 'IDLE') {
            this.performBleed();
        }

        
        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        if (this.y + this.h >= FLOOR_Y) {
            this.y = FLOOR_Y - this.h;
            this.vy = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        if (this.x < 0) this.x = 0;
        if (this.x + this.w > WIDTH) this.x = WIDTH - this.w;

        this.vx *= FRICTION;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;

        if (this.invertControlsTimer > 0) this.invertControlsTimer--;
    }

    performSilence() {
        this.silenceActive = true;
        this.silenceTimer = 15;
        this.silenceCooldown = 60;

        const reach = 70;
        const hitX = this.facingRight ? this.x + this.w : this.x - reach;

        spawnParticles(hitX + reach / 2, this.y + this.h / 2, "white", 5, 'spark');

        if (!(this.target || redCube).dead && rectIntersect(hitX, this.y, reach, this.h, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
            if (!(this.target || redCube).isInvincible) {
                (this.target || redCube).takeDamage(35 * this.damageMult);
                (this.target || redCube).vx = this.facingRight ? 10 : -10;
                (this.target || redCube).vy = -5;
                if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
            }
        } else {
            sessionStats.womboComboActive = false;
        }
    }

    activateHatred() {
        this.hatredActive = true;
        this.hatredTimer = 300; 
        this.hatredCooldown = 600;
        triggerShake(5);
        spawnParticles(this.x + this.w / 2, this.y + this.h / 2, "red", 30, 'spark');
    }

    fireBeam() {
        const beamW = 600;
        const beamH = 30;
        const beamX = this.facingRight ? this.x + this.w : this.x - beamW;
        const beamY = this.y + 15;

        triggerShake(10);

        if (rectIntersect(beamX, beamY, beamW, beamH, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
            (this.target || redCube).takeDamage(50 * this.damageMult);
            (this.target || redCube).vx = this.facingRight ? 15 : -15;
            if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
        } else {
            sessionStats.womboComboActive = false;
        }
    }

    performBleed() {
        this.bleedActive = true;
        this.bleedTimer = 20;
        this.bleedCooldown = 90;

        const reach = 100;
        const hitX = this.facingRight ? this.x + this.w : this.x - reach;

        spawnParticles(hitX + reach / 2, this.y + this.h / 2, "red", 15, 'bubble');

        if (!(this.target || redCube).dead && rectIntersect(hitX, this.y - 20, reach, this.h + 40, (this.target || redCube).x, (this.target || redCube).y, (this.target || redCube).w, (this.target || redCube).h)) {
            if (!(this.target || redCube).isInvincible) {
                (this.target || redCube).takeDamage(20 * this.damageMult);
                (this.target || redCube).vx = this.facingRight ? 12 : -12;
                (this.target || redCube).vy = -8;

                
                this.poisonTargets.push({
                    target: redCube,
                    ticksRemaining: 6,
                    tickTimer: 60
                });
                if (sessionStats.womboComboActive) sessionStats.womboComboHits++;
            }
        } else {
            sessionStats.womboComboActive = false;
        }
    }

    processPoisonDamage() {
        for (let i = this.poisonTargets.length - 1; i >= 0; i--) {
            const poison = this.poisonTargets[i];
            poison.tickTimer--;

            if (poison.tickTimer <= 0) {
                poison.tickTimer = 60;
                poison.ticksRemaining--;

                if (!poison.target.dead) {
                    poison.target.takeDamage(10);
                    poison.target.color = "#8B0000"; 
                    spawnParticles(poison.target.x + poison.target.w / 2, poison.target.y, "red", 2, 'bubble');
                    setTimeout(() => {
                        if (!poison.target.dead) {
                            poison.target.color = poison.target.baseColor || COLORS.RED;
                        }
                    }, 100);
                }

                if (poison.ticksRemaining <= 0) {
                    this.poisonTargets.splice(i, 1);
                }
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;
        if (isRetroMode) {
            ctx.fillStyle = this.baseColor;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            return;
        }

        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        
        if (this.hatredActive) {
            ctx.shadowColor = "#FF0000";
            ctx.shadowBlur = 20;
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
            ctx.shadowBlur = 0;
        } else {
            ctx.strokeStyle = "#9999CC";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        }

        
        ctx.fillStyle = this.hatredActive ? "#FF0000" : "#6666AA";
        const eyeX = this.facingRight ? this.x + 30 : this.x + 10;
        ctx.fillRect(eyeX, this.y + 10, 10, 10);

        
        if (this.silenceActive) {
            const reach = 70;
            const hitX = this.facingRight ? this.x + this.w : this.x - reach;
            ctx.fillStyle = "rgba(153, 153, 204, 0.6)";
            ctx.fillRect(hitX, this.y, reach, this.h);
        }

        
        if (this.beamState === 'FIRING') {
            ctx.fillStyle = "#AAAAFF";
            const beamW = 600;
            const beamX = this.facingRight ? this.x + this.w : this.x - beamW;

            ctx.shadowBlur = 10;
            ctx.shadowColor = "#AAAAFF";
            ctx.fillRect(beamX, this.y + 15, beamW, 30);

            ctx.fillStyle = "white";
            ctx.fillRect(beamX, this.y + 22, beamW, 16);
            ctx.shadowBlur = 0;
        }

        
        if (this.bleedActive) {
            const reach = 100;
            const hitX = this.facingRight ? this.x + this.w : this.x - reach;

            ctx.fillStyle = "rgba(139, 0, 0, 0.6)";
            ctx.fillRect(hitX, this.y - 20, reach, this.h + 40);

            
            for (let i = 0; i < 5; i++) {
                ctx.fillStyle = "rgba(139, 0, 0, 0.8)";
                ctx.beginPath();
                ctx.arc(hitX + Math.random() * reach, this.y + this.h + Math.random() * 20, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        
        ctx.font = "10px Arial";
        ctx.textAlign = "left";
        let indicatorY = this.y - 55;

        
        ctx.fillStyle = this.silenceCooldown > 0 ? "#666" : "#9999CC";
        ctx.fillText(`[SPACE] SILENCE ${this.silenceCooldown > 0 ? Math.ceil(this.silenceCooldown / 60) + 's' : 'READY'}`, this.x - 20, indicatorY);
        indicatorY += 12;

        
        ctx.fillStyle = this.hatredCooldown > 0 ? "#666" : "#8B0000";
        ctx.fillText(`[Q] HATRED ${this.hatredActive ? 'ACTIVE' : (this.hatredCooldown > 0 ? Math.ceil(this.hatredCooldown / 60) + 's' : 'READY')}`, this.x - 20, indicatorY);
        indicatorY += 12;

        
        ctx.fillStyle = this.beamState !== 'IDLE' ? "#666" : "#AAAAFF";
        ctx.fillText(`[F] BEAM ${this.beamState !== 'IDLE' ? 'CHARGING' : 'READY'}`, this.x - 20, indicatorY);
        indicatorY += 12;

        
        ctx.fillStyle = this.bleedCooldown > 0 ? "#666" : "#8B0000";
        ctx.fillText(`[E] BLEED ${this.bleedCooldown > 0 ? Math.ceil(this.bleedCooldown / 60) + 's' : 'READY'}`, this.x - 20, indicatorY);
        indicatorY += 12;

        
        ctx.fillStyle = "#CCCCFF";
        ctx.fillText(`JUMPS: ${this.jumpCount} (+${Math.min(this.jumpCount * 1.5, 10).toFixed(1)})`, this.x - 20, indicatorY);
    }
}


class RedCube extends Entity {
    constructor() {
        super(WIDTH - 100, FLOOR_Y - CUBE_SIZE, COLORS.RED, 100);
        this.facingRight = false;
        this.state = 'IDLE';
        this.stateTimer = 0;
        this.isInvincible = false;
        this.beamActive = false;
        
        this.dashTimer = 0;
    }

    update() {
        super.update();
        if (gameMode === 'p2p' && p2pRole === 'client') return;
        if (this.dead) return;

        
        if (this.stateTimer > 0) {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.state = 'IDLE';
                this.isInvincible = false;
                this.color = COLORS.RED;
            } else if (this.state === 'STUNNED') {
                this.vx = 0;
            }
            return;
        }

        const dist = Math.abs(this.x - blueCube.x);

        
        if (Math.random() < 0.02 && dist < 300) {
            
            this.state = 'DASHING';
            this.stateTimer = 20;
            this.vx = (blueCube.x < this.x) ? -15 : 15;
            this.isInvincible = true;
            this.color = "#FF4444"; 
        } else if (Math.random() < 0.005) {
            
            if (this.isGrounded) this.vy = -JUMP_FORCE;
        } else if (Math.random() < 0.01 && dist > 400) {
            
            this.state = 'LASER_CHARGE';
            this.stateTimer = 60; 
            this.color = "cyan"; 
        } else {
            
            if (blueCube.x < this.x) {
                this.vx = -MOVE_SPEED * 0.8;
                this.facingRight = false;
            } else {
                this.vx = MOVE_SPEED * 0.8;
                this.facingRight = true;
            }
        }

        
        if (this.state === 'LASER_CHARGE') {
            this.vx = 0; 
            if (this.stateTimer <= 1) { 
                this.fireBeam();
            }
        } else if (this.state === 'DASHING') {
            
            if (rectIntersect(this.x, this.y, this.w, this.h, blueCube.x, blueCube.y, blueCube.w, blueCube.h)) {
                blueCube.takeDamage(15);
                
                blueCube.vx = (this.vx > 0) ? 15 : -15;
                blueCube.vy = -5;
                this.state = 'IDLE'; 
                this.stateTimer = 0;
                this.isInvincible = false;
                this.color = COLORS.RED;
            }
        }
    }

    fireBeam() {
        const beamW = 800;
        const beamH = 30;
        const beamX = (blueCube.x < this.x) ? this.x - beamW : this.x + this.w;
        const beamY = this.y + 15;

        
        spawnParticles(this.x + this.w / 2, this.y + this.h / 2, "red", 20, 'spark');
        triggerShake(10);

        
        
        
        const firingLeft = (blueCube.x < this.x);

        
        
        this.beamActive = true;
        setTimeout(() => this.beamActive = false, 200);

        if (firingLeft) {
            if (blueCube.x < this.x && blueCube.y + blueCube.h > beamY && blueCube.y < beamY + beamH) {
                blueCube.takeDamage(30);
            }
        } else {
            
            if (blueCube.x > this.x && blueCube.y + blueCube.h > beamY && blueCube.y < beamY + beamH) {
                blueCube.takeDamage(30);
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;
        super.draw(ctx);

        if (this.beamActive) {
            ctx.fillStyle = "red";
            const beamW = 800;
            const beamX = (blueCube.x < this.x) ? this.x - beamW : this.x + this.w;
            ctx.fillRect(beamX, this.y + 15, beamW, 30);
            ctx.fillStyle = "white";
            ctx.fillRect(beamX, this.y + 22, beamW, 16);
        }

        if (this.state === 'LASER_CHARGE') {
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 40 * ((60 - this.stateTimer) / 60), 0, Math.PI * 2);
            ctx.strokeStyle = "cyan";
            ctx.stroke();
        }
    }
}

let blueCube = null;
let redCube = null;


function startGame(mode, modeInfo) {
    try {
        if (mode) gameMode = mode;
        gameState = 'playing';
        winner = null;
        shatterActive = false;
        isRetroMode = false;

        
        sessionStats = {
            beamStreak: 0,
            womboComboActive: true,
            womboComboHits: 0
        };

        
        navTo('game-container');
        document.getElementById('ui-layer').style.display = 'flex';
        document.querySelector('.sidebar').style.display = 'none';
        document.getElementById('game-over-screen').classList.add('hidden'); 
        document.getElementById('menu-overlay').style.pointerEvents = 'none'; 

        document.getElementById('rainbow-overlay').classList.remove('active');
        document.getElementById('rainbow-text').innerText = "";

        
        const CubeClass = getClassForId(selectedCubeId);
        blueCube = new CubeClass();

        
        if (gameMode === 'p2p') {
            let myId, otherId;

            if (p2pRole === 'host') {
                
                myId = (modeInfo && modeInfo.p1Id) ? modeInfo.p1Id : selectedCubeId;
                otherId = (modeInfo && modeInfo.p2Id) ? modeInfo.p2Id : 1;

                
                const MyClass = getClassForId(myId);
                blueCube = new MyClass();
                blueCube.x = 50;

                
                const OppClass = getClassForId(otherId);
                redCube = new OppClass();
                (this.target || redCube).x = WIDTH - 100;
                
                

                
                

                
                
                
                
                

                
                
                

                
                const P1Class = getClassForId(modeInfo.p1Id || 1);
                const P2Class = getClassForId(modeInfo.p2Id || 1);

                blueCube = new P1Class(); 
                redCube = new P2Class();  

                
                blueCube.x = 50;
                (this.target || redCube).x = WIDTH - 100;
            }
        } else {
            
            redCube = new RedCube();
        }

        
        if (blueCube instanceof Fbt7Cube) {
            
            
        }

        
        if (gameMode === 'sandbox') {
            
            redCube = new Entity(WIDTH - 150, FLOOR_Y - CUBE_SIZE, "gray", 9999);
            (this.target || redCube).ai = false; 
            (this.target || redCube).update = function () {
                this.vy += GRAVITY;
                this.y += this.vy;
                if (this.y + this.h >= FLOOR_Y) {
                    this.y = FLOOR_Y - this.h;
                    this.vy = 0;
                }
            }; 
        }

        updateUI();
        if (animationId) cancelAnimationFrame(animationId);
        gameLoop();
    } catch (e) {
        console.error("StartGame Error:", e);
        alert("Startup Error: " + e.message);
        showMainMenu();
    }
}

function getClassForId(id) {
    switch (id) {
        case 1: return BlueCube;
        case 2: return AngrySniperCube;
        case 3: return GreenCube;
        case 4: return PinkCube;
        case 5: return BrownCube;
        case 6: return PurpleCube;
        case 7: return VigilanteCube;
        case 8: return Fbt7Cube;
        case 9: return GoldCube;
        case 10: return Bobbythe124Cube;
        default: return BlueCube;
    }
}

function showMainMenu() {
    gameState = 'menu';
    navTo('screen-main');
    document.getElementById('ui-layer').style.display = 'none';
    if (animationId) cancelAnimationFrame(animationId);

    
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function showGameOver() {
    
    if (animationId) cancelAnimationFrame(animationId);
    gameState = 'gameover';

    const overlay = document.getElementById('menu-overlay');
    
    const winnerName = (winner === 'player') ? "PLAYER WINS" : "ENEMY WINS";

    alert(winnerName + "\nPress R to Restart");

    
    checkWinAchievements();
}

function checkWinAchievements() {
    if (winner === 'player') {
        
        unlockAchievement(1);

        
        if (blueCube.hp >= blueCube.maxHp) unlockAchievement(3);

        
        if (sessionStats.womboComboActive && sessionStats.womboComboHits >= 4) {
            unlockAchievement(4);
        }

        
    } else {
        
        
        
        
        
    }
}

function requestRestart() {
    startGame(gameMode);
}

function checkGameOver() {
    if (blueCube.hp <= 0) {
        winner = 'enemy';
        if (gameMode === 'p2p') {
            conn.send({ type: 'GAMEOVER', winner: 'enemy' });
        }
        showGameOver();
    } else if ((this.target || redCube).hp <= 0 && gameMode !== 'sandbox') {
        winner = 'player';
        if (gameMode === 'p2p') {
            conn.send({ type: 'GAMEOVER', winner: 'player' });
        }
        showGameOver();
    }
}

function updateUI() {
    if (!blueCube || !redCube) return;

    
    const p1Pct = (blueCube.hp / blueCube.maxHp) * 100;
    const p2Pct = ((this.target || redCube).hp / (this.target || redCube).maxHp) * 100;

    document.getElementById('p1-health').style.width = Math.max(0, p1Pct) + '%';
    document.getElementById('p2-health').style.width = Math.max(0, p2Pct) + '%';

    document.getElementById('p1-hp-text').innerText = Math.ceil(blueCube.hp);
    document.getElementById('p2-hp-text').innerText = Math.ceil((this.target || redCube).hp);

    
    const comboBox = document.getElementById('combo-box');
    if (sessionStats.womboComboHits > 1) {
        comboBox.style.display = 'flex';
        comboBox.innerText = sessionStats.womboComboHits;
    } else {
        comboBox.style.display = 'none';
    }
}


function gameLoop() {
    try {
        
        if (gameMode === 'p2p') {
            
            if (conn && conn.open) {
                conn.send({ type: 'INPUT', keys: keys });

                if (p2pRole === 'host') {
                    
                    updateGameLogic();
                    const state = {
                        type: 'STATE',
                        p1: { x: blueCube.x, y: blueCube.y, color: blueCube.color, hp: blueCube.hp, facingRight: blueCube.facingRight },
                        p2: { x: (this.target || redCube).x, y: (this.target || redCube).y, color: (this.target || redCube).color, hp: (this.target || redCube).hp, facingRight: (this.target || redCube).facingRight },
                        isRetroMode: isRetroMode,
                        shatterActive: shatterActive,
                        shards: shatterShards
                    };
                    conn.send(state);
                } else {
                    
                    
                }
            }
        } else {
            updateGameLogic();
        }

        
        drawGame();

        if (gameState === 'playing') {
            animationId = requestAnimationFrame(gameLoop);
        }
    } catch (e) {
        console.error("Game Loop Crash:", e);
        
    }
}

function updateGameLogic() {
    
    if (gameMode === 'p2p' && p2pRole === 'host') {
        const p1Keys = Object.assign({}, keys); 

        
        blueCube.update();

        
        for (let k in keys) delete keys[k];
        if (networkKeys) {
            for (let k in networkKeys) keys[k] = networkKeys[k];
        }

        (this.target || redCube).update();

        
        for (let k in keys) delete keys[k];
        for (let k in p1Keys) keys[k] = p1Keys[k];

    } else {
        if (blueCube) blueCube.update();
        if (redCube) (this.target || redCube).update();
    }

    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].update();
        if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }

    
    if (shakeMagnitude > 0) shakeMagnitude *= 0.9;
    if (shakeMagnitude < 0.5) shakeMagnitude = 0;

    
    if (shatterActive) {
        shatterShards.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.angle += s.rotSpeed;
            s.alpha *= 0.95;
        });
    }
}

function drawGame() {
    
    ctx.fillStyle = isRetroMode ? "#000" : "#f0f0f0";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    
    ctx.save();
    if (shakeMagnitude > 0) {
        const dx = (Math.random() - 0.5) * shakeMagnitude;
        const dy = (Math.random() - 0.5) * shakeMagnitude;
        ctx.translate(dx, dy);
    }

    
    if (!isRetroMode) {
        ctx.fillStyle = "#333";
        ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
    }

    
    particles.forEach(p => p.draw(ctx));

    
    if (blueCube) blueCube.draw(ctx);
    if (redCube) (this.target || redCube).draw(ctx);

    
    if (shatterActive) {
        shatterShards.forEach(s => {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.angle);
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = s.color;
            ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
            ctx.restore();
        });
    }

    
    floatingTexts.forEach(t => t.draw(ctx));

    ctx.restore();
}


function toggleSandboxMenu() {
    const min = document.getElementById('sandbox-menu');
    min.classList.toggle('active');

    if (min.classList.contains('active')) {
        renderSandboxList();
    }
}

function renderSandboxList() {
    const list = document.getElementById('sb-cube-list');
    list.innerHTML = '';

    CUBE_DATA.forEach(cube => {
        const div = document.createElement('div');
        div.className = 'sb-cube-item' + (blueCube.constructor.name === getClassForId(cube.id).name ? ' active' : '');
        div.innerHTML = `
            <div style="width:30px; height:30px; background:${cube.color}; margin-right:10px;"></div>
            <div>${cube.name}</div>
        `;
        div.onclick = () => {
            switchPlayerCube(cube.id);
            toggleSandboxMenu(); 
            
        };
        list.appendChild(div);
    });
}

function switchPlayerCube(id) {
    const x = blueCube.x;
    const y = blueCube.y;
    const hp = blueCube.hp;

    const CubeClass = getClassForId(id);
    blueCube = new CubeClass();
    blueCube.x = x;
    blueCube.y = y;
    
    
}


gameState = 'menu';
showMainMenu();
ctx.fillStyle = "#f0f0f0";
ctx.fillRect(0, 0, WIDTH, HEIGHT);
