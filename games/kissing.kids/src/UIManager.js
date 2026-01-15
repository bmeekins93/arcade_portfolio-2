export class UIManager {
    constructor() {
        this.titleScreen = document.getElementById('title-screen');
        this.hud = document.getElementById('hud');
        this.victoryScreen = document.getElementById('victory-screen');
        this.arrestScreen = document.getElementById('arrest-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.pauseScreen = document.getElementById('pause-screen');

        this.timerEl = document.getElementById('timer');
        this.powerMeter = document.getElementById('power-meter');
        this.powerText = document.getElementById('power-text');
        this.soothedEl = document.getElementById('soothed');
        this.scoreEl = document.getElementById('score');
        this.activeEl = document.getElementById('active');

        this.victoryScore = document.getElementById('victory-score');
        this.victorySoothed = document.getElementById('victory-soothed');
        this.winLine1 = document.getElementById('win-line-1');
        this.winLine2 = document.getElementById('win-line-2');

        this.gayrayButton = document.getElementById('gayray-button');

        // Buttons
        this.buttons = {
            start: document.getElementById('start-button'),
            gayray: document.getElementById('gayray-button'),
            pause: document.getElementById('pause-button'),
            restart: document.getElementById('restart-button'),
            resume: document.getElementById('resume-button'),
            retry: document.getElementById('retry-button'),
            home: document.getElementById('home-button'),
            homeGo: document.getElementById('home-go-button'),
            homePause: document.getElementById('home-pause-button'),
            restartPause: document.getElementById('restart-pause-button')
        };
    }

    reset() {
        this.titleScreen.style.display = 'flex';
        this.hud.style.display = 'none';
        this.victoryScreen.style.display = 'none';
        this.arrestScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.pauseScreen.style.display = 'none';
        this.winLine1.style.display = 'none';
        this.winLine2.style.display = 'none';
    }

    startGame() {
        this.titleScreen.style.display = 'none';
        this.hud.style.display = 'flex';
    }

    showVictory(score, soothed) {
        this.hud.style.display = 'none';
        this.victoryScreen.style.display = 'flex';
        this.victoryScore.innerText = score;
        this.victorySoothed.innerText = soothed;

        setTimeout(() => this.winLine1.style.display = 'block', 6000);
        setTimeout(() => this.winLine2.style.display = 'block', 7000);
    }

    hideVictory() {
        this.victoryScreen.style.display = 'none';
    }

    showArrest() {
        this.arrestScreen.style.display = 'flex';
    }

    showGameOver() {
        this.hud.style.display = 'none';
        this.gameOverScreen.style.display = 'flex';
    }

    togglePause(paused) {
        if (paused) {
            this.pauseScreen.style.display = 'flex';
        } else {
            this.pauseScreen.style.display = 'none';
        }
    }

    updateHUD(score, soothed, activeCount) {
        this.soothedEl.innerText = soothed;
        this.scoreEl.innerText = score;
        this.activeEl.innerText = activeCount;
    }

    updateTimer(timer) {
        const min = Math.floor(timer / 60).toString().padStart(2, '0');
        const sec = Math.floor(timer % 60).toString().padStart(2, '0');
        this.timerEl.innerText = `${min}:${sec}`;
    }

    updatePower(power, isMobile) {
        this.powerMeter.style.width = `${power}%`;

        if (power >= 100) {
            this.powerText.innerText = "READY!";
            this.powerText.style.color = "#FFFF00";
            this.gayrayButton.style.display = 'block';
        } else {
            this.powerText.innerText = "GAYRAY";
            this.powerText.style.color = "white";
            this.gayrayButton.style.display = 'none';
        }
    }
}
