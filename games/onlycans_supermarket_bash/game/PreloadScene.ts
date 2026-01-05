
import Phaser from 'phaser';
import { CHARACTERS, WORLDS } from './constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Explicitly set CORS for loader
    this.load.crossOrigin = 'anonymous';

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Progress Bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 + 30, 320, 30);

    const loadingText = this.add.text(width / 2, height / 2 - 10, 'Loading Assets...', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2 + 45, '0%', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x3b82f6, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 40, 300 * value, 10);
    });

    // Debug logging for successful loads
    this.load.on('filecomplete', (key: string) => {
      console.log(`[Preload] Successfully loaded: ${key}`);
    });

    this.load.on('complete', () => {
      console.log('[Preload] All assets loaded. Transitioning...');
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    this.load.on('loaderror', (file: any) => {
      console.error('[Preload] Asset load failed:', file.key, file.src);
      loadingText.setText('Load Error! Check Console.');
      loadingText.setColor('#ff0000');
    });

    // Load character assets
    CHARACTERS.forEach(char => {
      // If character uses a sprite sheet/atlas
      if (char.atlasUrl && char.atlasData) {
        this.load.image(`${char.id}_atlas_img`, char.atlasUrl);
      }
      // Fallback to individual images
      else if (char.assets) {
        this.load.image(`${char.id}_idle`, char.assets.idle);
        this.load.image(`${char.id}_run`, char.assets.run);
        this.load.image(`${char.id}_jump`, char.assets.jump);
        this.load.image(`${char.id}_jab`, char.assets.jab);
        this.load.image(`${char.id}_special`, char.assets.special);
        this.load.image(`${char.id}_block`, char.assets.block);
      }

      // Load player card if available
      if (char.cardImg) {
        this.load.image(`card_${char.id}`, char.cardImg);
      }
    });

    // 2a. Load World Backgrounds
    WORLDS.forEach(world => {
      if (world.layers) {
        world.layers.forEach((layerUrl, index) => {
          this.load.image(`world_${world.id}_layer_${index}`, layerUrl);
        });
      }
      // Load preview image if available
      if ((world as any).previewImg) {
        this.load.image(`world_${world.id}_preview`, (world as any).previewImg);
      }
    });
  }

  create() {
    // Construct the Atlas from the loaded image and provided JSON data
    CHARACTERS.forEach(char => {
      if (char.atlasUrl && char.atlasData) {
        const key = `${char.id}_atlas_img`;
        if (this.textures.exists(key)) {
          // Add atlas: key, source image, atlas JSON
          this.textures.addAtlas(char.id, this.textures.get(key).getSourceImage() as HTMLImageElement, char.atlasData);
          console.log(`[Preload] Created atlas for ${char.id}`);
        }
      }
    });

    // Transition to menu only after create ensures assets are ready
    this.scene.start('MainMenuScene');
  }
}