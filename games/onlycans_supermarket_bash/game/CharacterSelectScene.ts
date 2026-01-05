import Phaser from 'phaser';
import { CharacterBase } from './types';
import { WORLD, CHARACTERS } from './constants';

export class CharacterSelectScene extends Phaser.Scene {
  players: { p1: CharacterBase | null; p2: CharacterBase | null };
  turn: 'p1' | 'p2';
  titleText: any;
  cards: any[];

  constructor() {
    super({ key: 'CharacterSelectScene' });
    this.players = { p1: null, p2: null };
    this.turn = 'p1';
    this.cards = [];
  }

  create() {
    this.players = { p1: null, p2: null };
    this.turn = 'p1';

    // Background
    this.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 0x1e293b);

    // Title
    this.titleText = this.add.text(WORLD.width / 2, 60, 'PLAYER 1 SELECT', {
      fontFamily: '"Arial Black", sans-serif',
      fontSize: '42px',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Character Cards
    const startX = WORLD.width / 2 - ((CHARACTERS.length - 1) * 200) / 2;
    const centerY = WORLD.height / 2;

    this.cards = CHARACTERS.map((char, index) => {
      const x = startX + index * 200;

      const container = this.add.container(x, centerY);
      let interactiveElement;

      if (char.cardImg) {
        // Use provided card image
        const img = this.add.image(0, 0, `card_${char.id}`).setInteractive();
        // Scale to fit consistent height while maintaining aspect ratio
        img.displayHeight = 260;
        img.scaleX = img.scaleY;

        container.add(img);
        interactiveElement = img;
      } else {
        // Render default placeholder
        const bg = this.add.rectangle(0, 0, 160, 260, 0x334155).setInteractive();
        bg.setStrokeStyle(4, 0x000000);

        const portrait = this.add.rectangle(0, -40, 100, 100, char.color);

        const name = this.add.text(0, 50, char.name, {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#fff',
          align: 'center',
          wordWrap: { width: 140 }
        }).setOrigin(0.5);

        container.add([bg, portrait, name]);
        interactiveElement = bg;
      }

      // Store data
      (container as any).charData = char;

      // Hover effects
      interactiveElement.on('pointerover', () => {
        if (!char.cardImg) (interactiveElement as Phaser.GameObjects.Rectangle).setFillStyle(0x475569);
        this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
      });
      interactiveElement.on('pointerout', () => {
        if (!char.cardImg) (interactiveElement as Phaser.GameObjects.Rectangle).setFillStyle(0x334155);
        this.tweens.add({ targets: container, scale: 1, duration: 100 });
      });
      interactiveElement.on('pointerdown', () => this.selectCharacter(char));

      return container;
    });

    // P1 / P2 Indicators
    this.add.text(WORLD.width * 0.25, WORLD.height - 80, 'P1: WASD + Space', { color: '#94a3b8' }).setOrigin(0.5);
    this.add.text(WORLD.width * 0.75, WORLD.height - 80, 'P2: Arrows + Enter', { color: '#94a3b8' }).setOrigin(0.5);
  }

  selectCharacter(char: CharacterBase) {
    if (this.turn === 'p1') {
      this.players.p1 = char;
      this.turn = 'p2';
      this.titleText.setText('PLAYER 2 SELECT');
      this.titleText.setStyle({ color: '#ff5a5a' }); // Change color for P2

      // Visual feedback for P1 selection
      this.cameras.main.flash(200, 59, 130, 246);

    } else {
      this.players.p2 = char;
      this.cameras.main.flash(200, 239, 68, 68);

      this.time.delayedCall(500, () => {
        this.scene.start('WorldSelectScene', this.players);
      });
    }
  }
}