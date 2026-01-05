import Phaser from 'phaser';
import { WORLD } from './constants';

export class MainMenuScene extends Phaser.Scene {
  startText: any;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    // Background
    this.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 0x0f172a);

    // Dynamic background effect (simple scrolling lines)
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x1e293b, 0.5);
    for (let i = 0; i < 20; i++) {
      graphics.moveTo(0, i * 30);
      graphics.lineTo(WORLD.width, i * 30 + 100);
    }
    graphics.strokePath();

    // Title
    const title = this.add.text(WORLD.width / 2, WORLD.height * 0.35, 'ONLYCANS', {
      fontFamily: '"Arial Black", Gadget, sans-serif',
      fontSize: '120px',
      color: 'transparent',
      stroke: '#3b82f6',
      strokeThickness: 8,
      shadow: { offsetX: 4, offsetY: 4, color: '#ef4444', blur: 0, stroke: true, fill: true }
    }).setOrigin(0.5);

    // Gradient fill for title
    const gradient = title.context.createLinearGradient(0, 0, 0, title.height);
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#60a5fa');
    title.setFill(gradient);

    // Subtitle
    this.add.text(WORLD.width / 2, WORLD.height * 0.52, 'SUPER MARKET BASH', {
      fontFamily: '"Courier New", monospace',
      fontSize: '32px',
      color: '#f8fafc',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setLetterSpacing(4);

    // Start Prompt
    this.startText = this.add.text(WORLD.width / 2, WORLD.height * 0.75, 'PRESS START / CLICK', {
      fontFamily: '"Courier New", monospace',
      fontSize: '24px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Input listeners
    this.input.keyboard.on('keydown', () => this.startGame());
    this.input.on('pointerdown', () => this.startGame());

    // Blink effect
    this.tweens.add({
      targets: this.startText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  startGame() {
    this.scene.start('CharacterSelectScene');
  }
}