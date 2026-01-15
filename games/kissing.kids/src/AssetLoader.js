export class AssetLoader {
    constructor() {
        this.images = {};
        this.audio = {};
        this.videos = {};
    }

    async load() {
        const promises = [];

        // Define Images
        const imageSources = {
            patrickNormal: 'assets/images/patrick_normal.png',
            patrickKiss: 'assets/images/patrick_kiss.png',
            baby1: 'assets/images/baby1.png',
            baby1Alt: 'assets/images/baby1_alt.png',
            vapBaby: 'assets/images/vap_baby.png'
        };

        // Load Images
        for (const [key, src] of Object.entries(imageSources)) {
            promises.push(new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve();
                img.onerror = () => {
                    console.error(`Failed to load ${src}`);
                    resolve(); // Resolve anyway to proceed
                };
                this.images[key] = img;
            }));
        }

        // Audio
        this.audio.mainMusic = document.getElementById('main-music');
        this.audio.kissSound = document.getElementById('kiss-sound');
        this.audio.crySounds = [
            document.getElementById('cry1'),
            document.getElementById('cry2'),
            document.getElementById('cry3'),
            document.getElementById('cry4')
        ];

        // Videos
        this.videos.introBg = document.getElementById('intro-bg');
        this.videos.gameBg = document.getElementById('game-bg');
        this.videos.copsLights = document.getElementById('cops-lights');

        // Initialize visibility
        this.videos.introBg.classList.add('active');
        this.videos.gameBg.classList.remove('active');
        this.videos.copsLights.classList.remove('active');

        // Optional: Wait for videos to have metadata? 
        // For now, we trust browser caching or streaming, but images are critical.
        return Promise.all(promises);
    }

    playIntro() {
        this.hideAllVideos();
        this.videos.introBg.classList.add('active');
        this.videos.introBg.play();
        this.audio.mainMusic.play();
    }

    stopIntro() {
        this.videos.introBg.pause();
        this.videos.introBg.currentTime = 0;
        this.videos.introBg.classList.remove('active');
    }

    playGameBg() {
        this.hideAllVideos();
        this.videos.gameBg.classList.add('active');
        this.videos.gameBg.play();
    }

    stopGameBg() {
        this.videos.gameBg.pause();
        this.videos.gameBg.currentTime = 0;
        this.videos.gameBg.classList.remove('active');
    }

    playCopsLights() {
        this.hideAllVideos();
        this.videos.copsLights.classList.add('active');
        this.videos.copsLights.play();
    }

    stopCopsLights() {
        this.videos.copsLights.pause();
        this.videos.copsLights.currentTime = 0;
        this.videos.copsLights.classList.remove('active');
    }

    hideAllVideos() {
        this.videos.introBg.classList.remove('active');
        this.videos.gameBg.classList.remove('active');
        this.videos.copsLights.classList.remove('active');
    }

    resetAudio() {
        this.audio.mainMusic.pause();
        this.audio.mainMusic.currentTime = 0;
        this.audio.crySounds.forEach(c => { c.pause(); c.currentTime = 0; });
        this.stopCopsLights(); // Use the helper
    }
}
