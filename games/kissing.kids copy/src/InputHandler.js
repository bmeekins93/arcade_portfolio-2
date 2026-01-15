export class InputHandler {
    constructor(canvas, isMobile, babyPool, gameCallbacks) {
        this.canvas = canvas;
        this.isMobile = isMobile;
        this.babyPool = babyPool;
        this.callbacks = gameCallbacks;

        this.dragTargets = new Map();
        this.mouseDown = false;
        this.draggedBaby = null;
        this.aimX = 0;
        this.aimY = 0;

        this.setupHammer();
        this.setupEvents();
    }

    setupHammer() {
        const hammer = new Hammer.Manager(this.canvas, {
            recognizers: [
                [Hammer.Pan, { direction: Hammer.DIRECTION_ALL, pointers: 0 }]
            ]
        });
        hammer.get('pan').set({ enable: true });
    }

    setupEvents() {
        // Aggressive non-passive listeners to prevent scrolling
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleTouchStart(e) {
        if (!this.callbacks.isRunning()) return;

        // Prevent default browser behavior (scroll/zoom)
        if (e.cancelable) e.preventDefault();

        for (const touch of e.changedTouches) {
            const { clientX, clientY } = touch;
            const rect = this.canvas.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            // Check babies in reverse order (top first)
            for (let i = this.babyPool.activeBabies.length - 1; i >= 0; i--) {
                const baby = this.babyPool.activeBabies[i];
                if (!baby.dragged && x > baby.x && x < baby.x + baby.width && y > baby.y && y < baby.y + baby.height) {
                    baby.dragged = true;
                    baby.touchId = touch.identifier;
                    this.dragTargets.set(touch.identifier, baby);
                    break;
                }
            }
        }
    }

    handleTouchMove(e) {
        if (e.cancelable) e.preventDefault();

        for (const touch of e.changedTouches) {
            const baby = this.dragTargets.get(touch.identifier);
            if (baby) {
                const rect = this.canvas.getBoundingClientRect();
                // Offset y by -50px (or suitable amount) so finger doesn't hide baby
                const touchOffset = this.isMobile ? 60 : 0;
                baby.x = touch.clientX - rect.left - baby.width / 2;
                baby.y = touch.clientY - rect.top - baby.height / 2 - touchOffset;
            } else if (this.callbacks.isGayrayActive()) {
                this.aimX = touch.clientX - this.canvas.getBoundingClientRect().left;
                this.aimY = touch.clientY - this.canvas.getBoundingClientRect().top;
                this.callbacks.updateGayrayAim(this.aimX, this.aimY);
            }
        }
    }

    handleTouchEnd(e) {
        // e.preventDefault() on touchend might prevent click events on buttons if not careful, 
        // but here we are on the canvas.
        if (e.cancelable) e.preventDefault();

        for (const touch of e.changedTouches) {
            const baby = this.dragTargets.get(touch.identifier);
            if (baby) {
                this.callbacks.checkKiss(baby);
                baby.dragged = false;
                baby.touchId = null;
                this.dragTargets.delete(touch.identifier);
            }
        }
    }

    handleMouseDown(e) {
        if (this.callbacks.isGayrayActive() || !this.callbacks.isRunning() || this.isMobile) return;

        const x = e.clientX - this.canvas.getBoundingClientRect().left;
        const y = e.clientY - this.canvas.getBoundingClientRect().top;

        for (let i = this.babyPool.activeBabies.length - 1; i >= 0; i--) {
            const baby = this.babyPool.activeBabies[i];
            if (!baby.dragged && x > baby.x && x < baby.x + baby.width && y > baby.y && y < baby.y + baby.height) {
                this.draggedBaby = baby;
                baby.dragged = true;
                this.mouseDown = true;
                break;
            }
        }
    }

    handleMouseMove(e) {
        const x = e.clientX - this.canvas.getBoundingClientRect().left;
        const y = e.clientY - this.canvas.getBoundingClientRect().top;
        this.aimX = x;
        this.aimY = y;
        this.callbacks.updateGayrayAim(x, y);

        if (this.mouseDown && this.draggedBaby) {
            this.draggedBaby.x = x - this.draggedBaby.width / 2;
            this.draggedBaby.y = y - this.draggedBaby.height / 2;
        }
    }

    handleMouseUp(e) {
        if (this.mouseDown && this.draggedBaby) {
            this.callbacks.checkKiss(this.draggedBaby);
            this.draggedBaby.dragged = false;
            this.draggedBaby = null;
            this.mouseDown = false;
        }
    }

    handleKeyDown(e) {
        if (e.key === 'g') this.callbacks.tryGayray();
        if (e.key === 'Escape') this.callbacks.togglePause();
        if (e.key === 'r') this.callbacks.restartGame();
    }

    reset() {
        this.dragTargets.clear();
        this.mouseDown = false;
        this.draggedBaby = null;
    }
}
