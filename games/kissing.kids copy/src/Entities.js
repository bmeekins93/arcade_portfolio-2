import { MAX_ACTIVE_BABIES, HEAD_EXCLUSION_RADIUS_FACTOR, MIN_SPAWN_SEPARATION } from './Constants.js';

export class Patrick {
    constructor(canvas, isMobile) {
        this.canvas = canvas;
        this.isMobile = isMobile;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = this.getSize();
        this.kissing = false;
        this.kissTime = 0;
    }

    getSize() {
        const minDim = Math.min(this.canvas.width, this.canvas.height);
        let percent = this.isMobile ? (window.innerWidth < 768 ? 0.38 : 0.32) : 0.30;
        return minDim * percent;
    }

    updateSize() {
        this.size = this.getSize();
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
    }
}

export class BabyPool {
    constructor(canvas, isMobile) {
        this.canvas = canvas;
        this.isMobile = isMobile;
        this.pool = [];
        this.activeBabies = [];

        for (let i = 0; i < MAX_ACTIVE_BABIES + 10; i++) {
            this.pool.push(this.createBaby());
        }
    }

    createBaby() {
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

    getBabySize() {
        const minDim = Math.min(this.canvas.width, this.canvas.height);
        let percent = this.isMobile ? (window.innerWidth < 768 ? 0.12 : 0.10) : 0.08;
        return minDim * percent;
    }

    spawn(count, patrick) {
        for (let i = 0; i < count; i++) {
            if (this.activeBabies.length >= MAX_ACTIVE_BABIES) return;

            let baby;
            if (this.pool.length > 0) {
                baby = this.pool.pop();
            } else {
                baby = this.createBaby();
            }

            let placed = false;
            let attempts = 0;
            const exclusionRadius = patrick.size / 2 * HEAD_EXCLUSION_RADIUS_FACTOR;
            const hudHeight = 100; // Approximate HUD height
            const babySize = this.getBabySize();

            baby.width = babySize;
            baby.height = babySize;

            while (!placed && attempts < 10) {
                baby.x = Math.random() * (this.canvas.width - baby.width);
                baby.y = Math.random() * (this.canvas.height - baby.height - hudHeight) + hudHeight;

                const distToPatrick = Math.hypot(baby.x + baby.width / 2 - patrick.x, baby.y + baby.height / 2 - patrick.y);

                if (distToPatrick < exclusionRadius) {
                    attempts++;
                    continue;
                }

                let tooClose = false;
                for (const other of this.activeBabies) {
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
                this.activeBabies.push(baby);
            } else {
                // Return to pool if failed to place
                this.returnToPool(baby);
            }
        }
        return this.activeBabies.length > this.pool.length; // Create noise if spawned? Logic moved to main
    }

    returnToPool(baby) {
        baby.dragged = false;
        baby.cleared = false;
        baby.clearType = null;
        baby.touchId = null;
        this.pool.push(baby);
    }

    removeBaby(index) {
        const baby = this.activeBabies[index];
        this.activeBabies.splice(index, 1);
        this.returnToPool(baby);
    }

    updateSizes() {
        const size = this.getBabySize();
        this.activeBabies.forEach(b => {
            b.width = size;
            b.height = size;
        });
    }

    reset() {
        this.activeBabies.forEach(b => this.returnToPool(b));
        this.activeBabies = [];
    }
}
