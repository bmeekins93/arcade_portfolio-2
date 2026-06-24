import * as Constants from './Constants.js';
import { UIManager } from './UIManager.js';
import { AssetLoader } from './AssetLoader.js';
import { Patrick, BabyPool } from './Entities.js';
import { InputHandler } from './InputHandler.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isMobile = /Mobi|Android/i.test(navigator.userAgent);

        if (screen.orientation && this.isMobile) {
            screen.orientation.lock('landscape').catch(() => { });
        }

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.assets = new AssetLoader();
        this.ui = new UIManager();
        this.patrick = new Patrick(this.canvas, this.isMobile);
        this.babyPool = new BabyPool(this.canvas, this.isMobile);

        // Game State
        this.state = 'title'; // title, running, paused, victory, gameover
        this.paused = false;

        this.timer = Constants.ROUND_DURATION;
        this.soothed = 0;
        this.score = 0;
        this.power = 0;
        this.streak = 0;
        this.lastClearTime = 0;

        this.spawnInterval = null;
        this.spawnCount = 1;
        this.waveTimer = 0;
        this.cryActive = 0;

        this.gayrayActive = false;
        this.gayrayStartTime = 0;
        this.gayrayHits = 0;
        this.aimX = 0;
        this.aimY = 0;

        // Input
        this.input = new InputHandler(this.canvas, this.isMobile, this.babyPool, {
            isRunning: () => this.state === 'running' && !this.paused,
            isGayrayActive: () => this.gayrayActive,
            updateGayrayAim: (x, y) => { this.aimX = x; this.aimY = y; },
            checkKiss: (baby) => this.checkKiss(baby),
            tryGayray: () => this.activateGayray(),
            togglePause: () => this.togglePause(),
            restartGame: () => this.restartGame()
        });

        this.particles = [];
        this.shake = 0;

        this.bindUiEvents();

        // Initial Load
        this.assets.load().then(() => {
            // Hide loading, show title
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('title-screen').style.display = 'flex';
            this.resize(); // Ensure resize happens after load might help
        });

        // Start loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.patrick) this.patrick.updateSize();
        if (this.babyPool) this.babyPool.updateSizes();
    }

    bindUiEvents() {
        // Unlock AudioContext on first interaction
        const unlockAudio = () => {
            // Resume audio context if suspended (browser policy)
            // Then play intro bg if it was stuck
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();

            if (this.state === 'title' && this.assets.videos.introBg.paused) {
                this.assets.videos.introBg.play().catch(e => console.log("Intro play failed", e));
                this.assets.audio.mainMusic.play().catch(e => console.log("Music play failed", e));
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        // Wire UI buttons to their handlers (name -> action)
        const buttonHandlers = {
            start: () => this.startGame(),
            retry: () => this.restartGame(),
            home: () => this.resetGame(),
            homeGo: () => this.resetGame(),
            homePause: () => this.resetGame(),
            restartPause: () => this.restartGame(),
            resume: () => this.togglePause(),
            pause: () => this.togglePause(),
            restart: () => this.restartGame(),
            gayray: () => this.activateGayray()
        };
        for (const [name, handler] of Object.entries(buttonHandlers)) {
            const btn = this.ui.buttons[name];
            if (btn) btn.addEventListener('click', handler);
        }
    }

    spawnParticles(x, y, count, type) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200 + 50;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: type === 'beam' ? `hsl(${Math.random() * 360}, 100%, 50%)` : '#FFF',
                size: Math.random() * 5 + 2
            });
        }
    }

    updateParticles(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            p.life -= delta * 2; // Fade out speed
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
    }

    drawGayray(now) {
        // Screen Shake calculation
        const shakeAmt = 5;
        const sx = (Math.random() - 0.5) * shakeAmt;
        const sy = (Math.random() - 0.5) * shakeAmt;
        this.ctx.save();
        this.ctx.translate(sx, sy);

        // Beam Calculation
        const angle = Math.atan2(this.aimY - this.patrick.y, this.aimX - this.patrick.x);
        const dist = Math.hypot(this.aimX - this.patrick.x, this.aimY - this.patrick.y);
        const extX = this.patrick.x + (this.aimX - this.patrick.x) / dist * this.canvas.width * 2;
        const extY = this.patrick.y + (this.aimY - this.patrick.y) / dist * this.canvas.height * 2;

        // 1. Outer Glow (Pulsing Rainbow)
        const pulse = Math.sin(now * 10) * 0.2 + 1; // 0.8 to 1.2
        const width = this.canvas.width * Constants.GAYRAY_WIDTH_PERCENT * pulse;

        const gradient = this.ctx.createLinearGradient(this.patrick.x, this.patrick.y, this.aimX, this.aimY);
        const hueOffset = (now * 200) % 360;
        gradient.addColorStop(0, `hsl(${hueOffset}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${(hueOffset + 180) % 360}, 100%, 50%)`);

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = width * 1.5;
        this.ctx.lineCap = 'round';
        this.ctx.globalAlpha = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(this.patrick.x, this.patrick.y);
        this.ctx.lineTo(extX, extY);
        this.ctx.stroke();

        // 2. Inner Core (Bright White/Yellow)
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = width * 0.5;
        this.ctx.globalAlpha = 0.8;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'white';
        this.ctx.stroke();

        // 3. Impact Point (Aim)
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.aimX, this.aimY, width, 0, Math.PI * 2);
        this.ctx.fill();

        // Spawn particles along the beam occasionally
        if (Math.random() < 0.3) {
            const r = Math.random();
            const px = this.patrick.x + (extX - this.patrick.x) * r * 0.5; // Only first half of screen roughly
            const py = this.patrick.y + (extY - this.patrick.y) * r * 0.5;
            this.spawnParticles(px, py, 1, 'beam');
        }

        this.ctx.restore();
    }

    startGame() {
        this.state = 'running';
        this.ui.startGame();
        this.assets.stopIntro();
        this.assets.playGameBg();
        this.assets.audio.mainMusic.play();

        this.timer = Constants.ROUND_DURATION;
        this.soothed = 0;
        this.score = 0;
        this.power = 0;
        this.streak = 0;
        this.lastClearTime = 0;
        this.cryActive = 0;
        this.babyPool.reset();
        this.input.reset();
        this.assets.resetAudio();

        this.spawnCount = 1;
        this.waveTimer = 0;
        this.startSpawning();

        this.ui.updateHUD(this.score, this.soothed, 0);
        this.ui.updatePower(this.power, this.isMobile);
    }

    resetGame() {
        this.state = 'title';
        this.ui.reset();
        this.assets.resetAudio();
        this.assets.stopGameBg();
        this.assets.playIntro();
        this.babyPool.reset();
        this.gayrayActive = false;
        this.particles = [];
        clearInterval(this.spawnInterval);
    }

    restartGame() {
        this.resetGame();
        this.startGame();
    }

    togglePause() {
        if (this.state !== 'running') return;
        this.paused = !this.paused;
        this.ui.togglePause(this.paused);

        if (this.paused) {
            clearInterval(this.spawnInterval);
        } else {
            this.startSpawning();
        }
    }

    startSpawning() {
        clearInterval(this.spawnInterval);
        this.spawnInterval = setInterval(() => {
            if (!this.paused && this.state === 'running') {
                this.babyPool.spawn(this.spawnCount, this.patrick);
                this.manageCrySounds();
            }
        }, Constants.SPAWN_INTERVAL_BASE * 1000); // Note: Original was constant, logic had separate interval update. I should fix this logic.
        // Actually original updated interval on wave change.
    }

    updateWaves(delta) {
        this.waveTimer += delta;
        if (this.waveTimer >= Constants.WAVE_DURATION) {
            this.waveTimer -= Constants.WAVE_DURATION;
            this.spawnCount = Math.min(this.spawnCount + 1, Constants.SPAWN_COUNT_CAP);
            if (this.spawnCount === Constants.SPAWN_COUNT_CAP) {
                clearInterval(this.spawnInterval);
                this.spawnInterval = setInterval(() => {
                    if (!this.paused && this.state === 'running') {
                        this.babyPool.spawn(this.spawnCount, this.patrick);
                        this.manageCrySounds();
                    }
                }, Constants.SPAWN_INTERVAL_MIN * 1000);
            }
        }
    }

    manageCrySounds() {
        // Simple logic to play cry sounds if new babies are added
        // The original logic was inside spawn: if (cryActive < 4) play().
        // I need to track active cries better or just check periodically.
        // Let's stick to original behavior as best as possible.
        const currentActive = this.babyPool.activeBabies.length;
        // Approximation: if we have babies, ensure some sound plays.
        if (currentActive > 0 && this.cryActive < 4) {
            // Only increment if we actually start a sound? 
            // Original: activeBabies.push... cryActive++.
            // Simpler: Just try to play up to min(active, 4) sounds.
            for (let i = this.cryActive; i < Math.min(currentActive, 4); i++) {
                this.assets.audio.crySounds[i].play().catch(() => { });
                this.cryActive++;
            }
        }
    }

    checkKiss(baby) {
        const babyCenterX = baby.x + baby.width / 2;
        const babyCenterY = baby.y + baby.height / 2;
        const dist = Math.hypot(babyCenterX - this.patrick.x, babyCenterY - this.patrick.y);
        const snapRadius = Math.min(this.canvas.width, this.canvas.height) * Constants.SNAP_RADIUS_PERCENT;

        if (dist < snapRadius + this.patrick.size / 2 + baby.width / 2) {
            this.clearBaby(baby, 'kiss');
        }
    }

    clearBaby(baby, type) {
        baby.cleared = true;
        baby.clearTime = performance.now() / 1000;
        baby.clearType = type;

        const now = performance.now() / 1000;

        if (type === 'kiss') {
            this.patrick.kissing = true;
            this.patrick.kissTime = now;
            this.assets.audio.kissSound.play();

            // Duck cries
            this.assets.audio.crySounds.forEach(c => c.volume = 0.5);
            setTimeout(() => this.assets.audio.crySounds.forEach(c => c.volume = 1), Constants.KISS_FACE_TIME * 1000);

            if (now - this.lastClearTime < Constants.STREAK_WINDOW) {
                this.streak++;
            } else {
                this.streak = 1;
            }
            this.lastClearTime = now;

            const charge = Math.min(Constants.BASE_CHARGE + this.streak * Constants.STREAK_CHARGE, 0.15);
            if (!this.gayrayActive) this.power = Math.min(this.power + charge * 100, 100);
            this.ui.updatePower(this.power, this.isMobile);

            this.score += 10;
            this.soothed++;
        } else if (type === 'gayray') {
            this.score += 15;
            this.soothed++;
            this.gayrayHits++;
        }

        this.ui.updateHUD(this.score, this.soothed, this.babyPool.activeBabies.length);

        // Randomly reduce cry active count
        if (this.cryActive > 0 && Math.random() < 0.25) {
            this.cryActive--;
            this.assets.audio.crySounds[this.cryActive].pause();
            this.assets.audio.crySounds[this.cryActive].currentTime = 0;
        }
    }

    activateGayray() {
        if (this.power < 100 || this.gayrayActive) return;
        this.gayrayActive = true;
        this.gayrayStartTime = performance.now() / 1000;
        this.gayrayHits = 0;
        this.assets.audio.crySounds.forEach(c => c.volume = 0.63);

        if (this.isMobile) this.ui.gayrayButton.style.display = 'none';
    }

    updateGayray(delta) {
        const now = performance.now() / 1000;
        if (now - this.gayrayStartTime > Constants.GAYRAY_DURATION) {
            this.gayrayActive = false;
            this.power = 0;
            this.ui.updatePower(this.power, this.isMobile);
            this.assets.audio.crySounds.forEach(c => c.volume = 1);

            if (this.gayrayHits >= 5) {
                const bonus = 50 + 10 * (this.gayrayHits - 5);
                this.score += bonus;
                this.ui.updateHUD(this.score, this.soothed, this.babyPool.activeBabies.length);
            }
            return;
        }

        const beamWidth = this.canvas.width * Constants.GAYRAY_WIDTH_PERCENT;
        const angle = Math.atan2(this.aimY - this.patrick.y, this.aimX - this.patrick.x);

        this.babyPool.activeBabies.forEach(b => {
            if (!b.cleared) {
                const px = b.x + b.width / 2 - this.patrick.x;
                const py = b.y + b.height / 2 - this.patrick.y;
                const proj = px * Math.cos(angle) + py * Math.sin(angle);
                const dist = Math.abs(px * Math.sin(angle) - py * Math.cos(angle));

                if (dist < beamWidth / 2 + b.width / 2 && proj > 0) {
                    this.clearBaby(b, 'gayray');
                }
            }
        });
    }

    winGame() {
        this.state = 'victory';
        clearInterval(this.spawnInterval);
        this.assets.stopGameBg();
        this.assets.resetAudio();
        this.babyPool.reset();
        this.ui.showVictory(this.score, this.soothed);

        setTimeout(() => {
            this.ui.hideVictory();
            // Fade logic?
            setTimeout(() => {
                this.ui.showArrest();
                this.assets.playCopsLights();
            }, 2000);
        }, 8000);
    }

    gameOver() {
        this.state = 'gameover';
        clearInterval(this.spawnInterval);
        this.assets.stopGameBg();
        this.assets.resetAudio();
        this.babyPool.reset();
        this.ui.showGameOver();
    }

    gameLoop(timestamp) {
        const now = timestamp / 1000;
        // Real elapsed time keeps timers/motion wall-clock accurate across
        // refresh rates. Clamp to avoid huge jumps after tab switches/stalls.
        if (this.lastTimestamp === undefined) this.lastTimestamp = now;
        let delta = now - this.lastTimestamp;
        this.lastTimestamp = now;
        if (delta > 0.1) delta = 0.1;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update Patrick
        if (this.state !== 'title') {
            const patImg = this.patrick.kissing && now - this.patrick.kissTime < Constants.KISS_FACE_TIME
                ? this.assets.images.patrickKiss
                : this.assets.images.patrickNormal;

            this.ctx.drawImage(patImg,
                this.patrick.x - this.patrick.size / 2,
                this.patrick.y - this.patrick.size / 2,
                this.patrick.size,
                this.patrick.size
            );
        }

        // Update Babies
        for (let i = this.babyPool.activeBabies.length - 1; i >= 0; i--) {
            const baby = this.babyPool.activeBabies[i];

            // Check cleared removal
            if (baby.cleared) {
                const timeSinceClear = now - baby.clearTime;
                if ((baby.clearType === 'kiss' && timeSinceClear > Constants.BABY_DESPAWN_DELAY) ||
                    (baby.clearType === 'gayray' && timeSinceClear > Constants.VAP_FLASH_TIME)) {
                    this.babyPool.removeBaby(i);
                    continue;
                }
                if (baby.clearType === 'gayray') {
                    this.ctx.drawImage(this.assets.images.vapBaby, baby.x, baby.y, baby.width, baby.height);
                    continue;
                }
            }

            // Drag animation
            let img = this.assets.images.baby1;
            if (baby.dragged) {
                baby.dragTime += delta;
                if (baby.dragTime >= 0.3) {
                    baby.alt = !baby.alt;
                    baby.dragTime = 0;
                }
                img = baby.alt ? this.assets.images.baby1Alt : this.assets.images.baby1;

                // drag highlight
                this.ctx.save();
                this.ctx.shadowColor = '#00CCFF';
                this.ctx.shadowBlur = 15;
                this.ctx.drawImage(img, baby.x, baby.y, baby.width, baby.height);
                this.ctx.restore();
            } else {
                this.ctx.drawImage(img, baby.x, baby.y, baby.width, baby.height);
            }
        }

        // Gayray Beam and Particles
        if (this.gayrayActive) {
            this.drawGayray(now);
            // Spawn impact particles
            this.spawnParticles(this.aimX, this.aimY, 2, 'beam');
        }

        this.updateParticles(delta);
        this.drawParticles();

        // Logic
        if (this.state === 'running' && !this.paused) {
            this.timer -= delta;
            this.updateWaves(delta);
            if (this.gayrayActive) this.updateGayray(delta);

            if (this.timer <= 0) this.winGame();
            if (this.babyPool.activeBabies.length > Constants.MAX_ACTIVE_BABIES) this.gameOver();

            this.ui.updateTimer(this.timer);
            this.ui.activeEl.innerText = this.babyPool.activeBabies.length;
        }

        if (this.patrick.kissing && now - this.patrick.kissTime >= Constants.KISS_FACE_TIME) {
            this.patrick.kissing = false;
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Start
window.onload = () => {
    new Game();
};
