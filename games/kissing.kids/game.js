// game.js
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const introBg = document.getElementById('intro-bg');
const gameBg = document.getElementById('game-bg');
const copsLights = document.getElementById('cops-lights');
const mainMusic = document.getElementById('main-music');
const kissSound = document.getElementById('kiss-sound');
const crySounds = [
    document.getElementById('cry1'),
    document.getElementById('cry2'),
    document.getElementById('cry3'),
    document.getElementById('cry4')
];
const titleScreen = document.getElementById('title-screen');
const hud = document.getElementById('hud');
const victoryScreen = document.getElementById('victory-screen');
const arrestScreen = document.getElementById('arrest-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const pauseScreen = document.getElementById('pause-screen');
const startButton = document.getElementById('start-button');
const gayrayButton = document.getElementById('gayray-button');
const pauseButton = document.getElementById('pause-button');
const restartButton = document.getElementById('restart-button');
const resumeButton = document.getElementById('resume-button');
const retryButton = document.getElementById('retry-button');
const homeButton = document.getElementById('home-button');
const homeGoButton = document.getElementById('home-go-button');
const homePauseButton = document.getElementById('home-pause-button');
const restartPauseButton = document.getElementById('restart-pause-button');
const timerEl = document.getElementById('timer');
const powerMeter = document.getElementById('power-meter');
const soothedEl = document.getElementById('soothed');
const scoreEl = document.getElementById('score');
const activeEl = document.getElementById('active');
const victoryScore = document.getElementById('victory-score');
const victorySoothed = document.getElementById('victory-soothed');
const winLine1 = document.getElementById('win-line-1');
const winLine2 = document.getElementById('win-line-2');

let gameState = 'title';
let timer = 120;
let activeBabies = [];
let babyPool = [];
let soothed = 0;
let score = 0;
let power = 0;
let streak = 0;
let lastClearTime = 0;
let gayrayActive = false;
let gayrayStartTime = 0;
let gayrayHits = 0;
let paused = false;
let spawnInterval;
let spawnCount = 1;
let waveTimer = 0;
let cryActive = 0;
let dragTargets = new Map(); // For multi-touch
let aimX = 0;
let aimY = 0;
let animationFrame;

// Images
const patrickNormal = new Image();
patrickNormal.src = 'assets/images/patrick_normal.webp';
const patrickKiss = new Image();
patrickKiss.src = 'assets/images/patrick_kiss.webp';
const baby1 = new Image();
baby1.src = 'assets/images/baby1.webp';
const baby1Alt = new Image();
baby1Alt.src = 'assets/images/baby1_alt.webp';
const vapBaby = new Image();
vapBaby.src = 'assets/images/vap_baby.webp';

const ROUND_DURATION = 120;
const SPAWN_INTERVAL_BASE = 3.33;
const WAVE_DURATION = 10;
const SPAWN_COUNT_CAP = 10;
const SPAWN_INTERVAL_MIN = 1.00;
const MAX_ACTIVE_BABIES = 50;
const SNAP_RADIUS_PERCENT = 0.08;
const KISS_FACE_TIME = 0.25;
const BABY_DESPAWN_DELAY = 0.05;
const BASE_CHARGE = 0.06;
const STREAK_CHARGE = 0.01;
const STREAK_WINDOW = 2.0;
const GAYRAY_DURATION = 5.0;
const GAYRAY_WIDTH_PERCENT = 0.06;
const HEAD_EXCLUSION_RADIUS_FACTOR = 1.2;
const MIN_SPAWN_SEPARATION = 50; // pixels
const VAP_FLASH_TIME = 0.15;
const CRY_DUCK_KISS = -6; // dB, but simulate
const CRY_DUCK_GAYRAY = -4; // dB

// Device detection
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Resize canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Hammer.js for multi-touch
const hammer = new Hammer.Manager(canvas, {
    recognizers: [
        [Hammer.Pan, { direction: Hammer.DIRECTION_ALL, pointers: 0 }]
    ]
});
hammer.get('pan').set({ enable: true });

// Touch events
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);

// Lock orientation on mobile
if (screen.orientation && isMobile) {
    screen.orientation.lock('landscape').catch(() => {});
}

// Object pooling for babies
function createBaby() {
    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        dragged: false,
        dragTime: 0,
        alt: false,
        cleared: false,
        clearTime: 0,
        clearType: null,
        touchId: null
    };
}
for (let i = 0; i < MAX_ACTIVE_BABIES + 10; i++) {
    babyPool.push(createBaby());
}

function getPooledBaby() {
    if (babyPool.length > 0) {
        return babyPool.pop();
    }
    return createBaby();
}

function returnToPool(baby) {
    baby.dragged = false;
    baby.cleared = false;
    baby.clearType = null;
    baby.touchId = null;
    babyPool.push(baby);
}

// Calculate sizes
function getPatrickSize() {
    const minDim = Math.min(canvas.width, canvas.height);
    let percent = isMobile ? (window.innerWidth < 768 ? 0.38 : 0.32) : 0.30;
    return minDim * percent;
}

function getBabySize() {
    const minDim = Math.min(canvas.width, canvas.height);
    let percent = isMobile ? (window.innerWidth < 768 ? 0.12 : 0.10) : 0.08;
    return minDim * percent;
}

const patrick = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: getPatrickSize(),
    kissing: false,
    kissTime: 0
};

function updateSizes() {
    patrick.size = getPatrickSize();
    patrick.x = canvas.width / 2;
    patrick.y = canvas.height / 2;
    activeBabies.forEach(b => {
        b.width = getBabySize();
        b.height = getBabySize(); // Assume square
    });
}

window.addEventListener('resize', updateSizes);

// Spawn logic
function spawnBabies(count) {
    for (let i = 0; i < count; i++) {
        if (activeBabies.length >= MAX_ACTIVE_BABIES) return;
        const baby = getPooledBaby();
        let placed = false;
        let attempts = 0;
        const exclusionRadius = patrick.size / 2 * HEAD_EXCLUSION_RADIUS_FACTOR;
        const hudHeight = 100; // Approximate HUD height
        while (!placed && attempts < 10) {
            baby.x = Math.random() * (canvas.width - baby.width);
            baby.y = Math.random() * (canvas.height - baby.height - hudHeight) + hudHeight;
            const distToPatrick = Math.hypot(baby.x + baby.width/2 - patrick.x, baby.y + baby.height/2 - patrick.y);
            if (distToPatrick < exclusionRadius) {
                attempts++;
                continue;
            }
            let tooClose = false;
            for (const other of activeBabies) {
                const dist = Math.hypot(baby.x - other.x, baby.y - other.y);
                if (dist < MIN_SPAWN_SEPARATION) {
                    tooClose = true;
                    break;
                }
            }
            if (!tooClose) placed = true;
            attempts++;
        }
        if (placed) {
            baby.width = getBabySize();
            baby.height = getBabySize();
            activeBabies.push(baby);
            if (cryActive < 4) {
                crySounds[cryActive].play();
                cryActive++;
            }
        } // Else queue to next tick, but for simplicity, skip if not placed
    }
}

function startSpawning() {
    spawnInterval = setInterval(() => {
        spawnBabies(spawnCount);
    }, SPAWN_INTERVAL_BASE * 1000);
}

// Update wave
function updateWave(delta) {
    waveTimer += delta;
    if (waveTimer >= WAVE_DURATION) {
        waveTimer -= WAVE_DURATION;
        spawnCount = Math.min(spawnCount + 1, SPAWN_COUNT_CAP);
        if (spawnCount === SPAWN_COUNT_CAP) {
            // Optionally reduce interval, but prompt says optional floor after cap
            clearInterval(spawnInterval);
            spawnInterval = setInterval(() => {
                spawnBabies(spawnCount);
            }, SPAWN_INTERVAL_MIN * 1000);
        }
    }
}

// Drag handling
function handleTouchStart(e) {
    if (gayrayActive || gameState !== 'running' || paused) return;
    e.preventDefault();
    for (const touch of e.changedTouches) {
        const {clientX, clientY} = touch;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        for (let i = activeBabies.length - 1; i >= 0; i--) {
            const baby = activeBabies[i];
            if (!baby.dragged && x > baby.x && x < baby.x + baby.width && y > baby.y && y < baby.y + baby.height) {
                baby.dragged = true;
                baby.touchId = touch.identifier;
                dragTargets.set(touch.identifier, baby);
                break;
            }
        }
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
        const baby = dragTargets.get(touch.identifier);
        if (baby) {
            const rect = canvas.getBoundingClientRect();
            baby.x = touch.clientX - rect.left - baby.width / 2;
            baby.y = touch.clientY - rect.top - baby.height / 2;
        } else if (gayrayActive) {
            aimX = touch.clientX - canvas.getBoundingClientRect().left;
            aimY = touch.clientY - canvas.getBoundingClientRect().top;
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
        const baby = dragTargets.get(touch.identifier);
        if (baby) {
            checkKiss(baby);
            baby.dragged = false;
            baby.touchId = null;
            dragTargets.delete(touch.identifier);
        }
    }
}

let mouseDown = false;
let draggedBaby = null;

function handleMouseDown(e) {
    if (gayrayActive || gameState !== 'running' || paused || isMobile) return;
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    for (let i = activeBabies.length - 1; i >= 0; i--) {
        const baby = activeBabies[i];
        if (!baby.dragged && x > baby.x && x < baby.x + baby.width && y > baby.y && y < baby.y + baby.height) {
            draggedBaby = baby;
            baby.dragged = true;
            mouseDown = true;
            break;
        }
    }
}

function handleMouseMove(e) {
    aimX = e.clientX - canvas.getBoundingClientRect().left;
    aimY = e.clientY - canvas.getBoundingClientRect().top;
    if (mouseDown && draggedBaby) {
        draggedBaby.x = aimX - draggedBaby.width / 2;
        draggedBaby.y = aimY - draggedBaby.height / 2;
    } else if (gayrayActive) {
        // Aim beam
    }
}

function handleMouseUp(e) {
    if (mouseDown && draggedBaby) {
        checkKiss(draggedBaby);
        draggedBaby.dragged = false;
        draggedBaby = null;
        mouseDown = false;
    }
}

function checkKiss(baby) {
    const babyCenterX = baby.x + baby.width / 2;
    const babyCenterY = baby.y + baby.height / 2;
    const dist = Math.hypot(babyCenterX - patrick.x, babyCenterY - patrick.y);
    const snapRadius = Math.min(canvas.width, canvas.height) * SNAP_RADIUS_PERCENT;
    if (dist < snapRadius + patrick.size / 2 + baby.width / 2) {
        clearBaby(baby, 'kiss');
    }
}

function clearBaby(baby, type) {
    baby.cleared = true;
    baby.clearTime = performance.now() / 1000;
    baby.clearType = type;
    const now = performance.now() / 1000;
    if (type === 'kiss') {
        patrick.kissing = true;
        patrick.kissTime = now;
        kissSound.play();
        // Duck cries
        crySounds.forEach(c => c.volume = 0.5); // Simulate -6dB
        setTimeout(() => crySounds.forEach(c => c.volume = 1), KISS_FACE_TIME * 1000);
        if (now - lastClearTime < STREAK_WINDOW) {
            streak++;
        } else {
            streak = 1;
        }
        lastClearTime = now;
        const charge = Math.min(BASE_CHARGE + streak * STREAK_CHARGE, 0.15);
        if (!gayrayActive) power = Math.min(power + charge * 100, 100);
        updatePower();
        score += 10;
        soothed++;
    } else if (type === 'gayray') {
        score += 15;
        soothed++;
        gayrayHits++;
    }
    updateHUD();
    if (cryActive > 0 && Math.random() < 0.25) { // Approximate release
        cryActive--;
        crySounds[cryActive].pause();
        crySounds[cryActive].currentTime = 0;
    }
}

function updatePower() {
    powerMeter.style.width = `${power}%`;
    if (power >= 100) {
        if (isMobile) gayrayButton.style.display = 'block';
    } else {
        if (isMobile) gayrayButton.style.display = 'none';
    }
}

gayrayButton.addEventListener('click', activateGayray);
document.addEventListener('keydown', e => {
    if (e.key === 'g' && power >= 100 && !gayrayActive && gameState === 'running' && !paused) {
        activateGayray();
    } else if (e.key === 'Escape') {
        togglePause();
    } else if (e.key === 'r') {
        restartGame();
    }
});

function activateGayray() {
    if (power < 100 || gayrayActive) return;
    gayrayActive = true;
    gayrayStartTime = performance.now() / 1000;
    gayrayHits = 0;
    // Duck cries
    crySounds.forEach(c => c.volume = 0.63); // Simulate -4dB (0.63 ~ 10^(-4/20))
    if (isMobile) gayrayButton.style.display = 'none';
}

function updateGayray(delta) {
    const now = performance.now() / 1000;
    if (now - gayrayStartTime > GAYRAY_DURATION) {
        gayrayActive = false;
        power = 0;
        updatePower();
        crySounds.forEach(c => c.volume = 1);
        if (gayrayHits >= 5) {
            const bonus = 50 + 10 * (gayrayHits - 5);
            score += bonus;
            updateHUD();
        }
        return;
    }
    // Check hits
    const beamWidth = canvas.width * GAYRAY_WIDTH_PERCENT;
    const angle = Math.atan2(aimY - patrick.y, aimX - patrick.x);
    activeBabies.forEach(b => {
        if (!b.cleared) {
            // Simple line intersection check, approximate with distance to line
            const px = b.x + b.width / 2 - patrick.x;
            const py = b.y + b.height / 2 - patrick.y;
            const proj = px * Math.cos(angle) + py * Math.sin(angle);
            const dist = Math.abs(px * Math.sin(angle) - py * Math.cos(angle));
            if (dist < beamWidth / 2 + b.width / 2 && proj > 0) {
                clearBaby(b, 'gayray');
            }
        }
    });
}

// Game loop
function gameLoop() {
    const now = performance.now() / 1000;
    const delta = 1 / 60; // Assume 60fps

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Patrick
    updateSizes();
    const patImg = patrick.kissing && now - patrick.kissTime < KISS_FACE_TIME ? patrickKiss : patrickNormal;
    ctx.drawImage(patImg, patrick.x - patrick.size / 2, patrick.y - patrick.size / 2, patrick.size, patrick.size);

    // Draw babies
    for (let i = activeBabies.length - 1; i >= 0; i--) {
        const baby = activeBabies[i];
        if (baby.cleared) {
            if (baby.clearType === 'kiss' && now - baby.clearTime > BABY_DESPAWN_DELAY ||
                baby.clearType === 'gayray' && now - baby.clearTime > VAP_FLASH_TIME) {
                activeBabies.splice(i, 1);
                returnToPool(baby);
                continue;
            }
            if (baby.clearType === 'gayray') {
                ctx.drawImage(vapBaby, baby.x, baby.y, baby.width, baby.height);
                continue;
            }
        }
        let img = baby1;
        if (baby.dragged) {
            baby.dragTime += delta;
            if (baby.dragTime >= 0.3) {
                baby.alt = !baby.alt;
                baby.dragTime = 0;
            }
            img = baby.alt ? baby1Alt : baby1;
        }
        ctx.drawImage(img, baby.x, baby.y, baby.width, baby.height);
    }

    if (gayrayActive) {
        // Draw beam
        const gradient = ctx.createLinearGradient(patrick.x, patrick.y, aimX, aimY);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.14, 'orange');
        gradient.addColorStop(0.28, 'yellow');
        gradient.addColorStop(0.42, 'green');
        gradient.addColorStop(0.56, 'blue');
        gradient.addColorStop(0.7, 'indigo');
        gradient.addColorStop(0.84, 'violet');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = canvas.width * GAYRAY_WIDTH_PERCENT;
        ctx.beginPath();
        ctx.moveTo(patrick.x, patrick.y);
        const dist = Math.hypot(aimX - patrick.x, aimY - patrick.y);
        const extX = patrick.x + (aimX - patrick.x) / dist * canvas.width * 2;
        const extY = patrick.y + (aimY - patrick.y) / dist * canvas.height * 2;
        ctx.lineTo(extX, extY);
        ctx.stroke();
    }

    if (gameState === 'running' && !paused) {
        timer -= delta;
        updateWave(delta);
        if (gayrayActive) updateGayray(delta);
        if (timer <= 0) {
            winGame();
        }
        if (activeBabies.length > MAX_ACTIVE_BABIES) {
            gameOver();
        }
        updateTimer();
        activeEl.innerText = activeBabies.length;
    }

    // Check kiss end
    if (patrick.kissing && now - patrick.kissTime >= KISS_FACE_TIME) {
        patrick.kissing = false;
    }

    animationFrame = requestAnimationFrame(gameLoop);
}

// Update HUD
function updateHUD() {
    soothedEl.innerText = soothed;
    scoreEl.innerText = score;
    activeEl.innerText = activeBabies.length;
}

function updateTimer() {
    const min = Math.floor(timer / 60).toString().padStart(2, '0');
    const sec = Math.floor(timer % 60).toString().padStart(2, '0');
    timerEl.innerText = `${min}:${sec}`;
}

// State transitions
function startGame() {
    gameState = 'running';
    titleScreen.style.display = 'none';
    introBg.pause();
    introBg.currentTime = 0;
    hud.style.display = 'flex';
    gameBg.play();
    mainMusic.play(); // Continues from title
    timer = ROUND_DURATION;
    soothed = 0;
    score = 0;
    power = 0;
    streak = 0;
    lastClearTime = 0;
    activeBabies = [];
    dragTargets.clear();
    cryActive = 0;
    crySounds.forEach(c => { c.pause(); c.currentTime = 0; });
    spawnCount = 1;
    waveTimer = 0;
    startSpawning();
    updateHUD();
    updatePower();
    gameLoop();
}

function winGame() {
    gameState = 'victory';
    clearInterval(spawnInterval);
    hud.style.display = 'none';
    gameBg.pause();
    gameBg.currentTime = 0;
    mainMusic.pause();
    mainMusic.currentTime = 0;
    crySounds.forEach(c => { c.pause(); c.currentTime = 0; });
    victoryScreen.style.display = 'flex';
    victoryScore.innerText = score;
    victorySoothed.innerText = soothed;
    setTimeout(() => winLine1.style.display = 'block', 6000);
    setTimeout(() => winLine2.style.display = 'block', 7000);
    setTimeout(() => {
        victoryScreen.style.display = 'none';
        // Fade to black simulated by css or just hide
        setTimeout(() => {
            arrestScreen.style.display = 'flex';
            copsLights.play();
        }, 2000);
    }, 8000);
}

function gameOver() {
    gameState = 'gameover';
    clearInterval(spawnInterval);
    hud.style.display = 'none';
    gameBg.pause();
    gameBg.currentTime = 0;
    mainMusic.pause();
    mainMusic.currentTime = 0;
    crySounds.forEach(c => { c.pause(); c.currentTime = 0; });
    gameOverScreen.style.display = 'flex';
}

function togglePause() {
    if (gameState !== 'running') return;
    paused = !paused;
    if (paused) {
        clearInterval(spawnInterval);
        pauseScreen.style.display = 'flex';
        cancelAnimationFrame(animationFrame);
    } else {
        pauseScreen.style.display = 'none';
        startSpawning();
        gameLoop();
    }
}

function restartGame() {
    resetGame();
    startGame();
}

function resetGame() {
    gameState = 'title';
    titleScreen.style.display = 'flex';
    hud.style.display = 'none';
    victoryScreen.style.display = 'none';
    arrestScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    winLine1.style.display = 'none';
    winLine2.style.display = 'none';
    copsLights.pause();
    copsLights.currentTime = 0;
    introBg.play();
    mainMusic.play();
    cancelAnimationFrame(animationFrame);
    activeBabies.forEach(returnToPool);
    activeBabies = [];
}

// Event listeners
startButton.addEventListener('click', startGame);
retryButton.addEventListener('click', restartGame);
homeButton.addEventListener('click', resetGame);
homeGoButton.addEventListener('click', resetGame);
homePauseButton.addEventListener('click', resetGame);
restartPauseButton.addEventListener('click', restartGame);
resumeButton.addEventListener('click', togglePause);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', restartGame);

// Initial setup
introBg.play();
mainMusic.play();
