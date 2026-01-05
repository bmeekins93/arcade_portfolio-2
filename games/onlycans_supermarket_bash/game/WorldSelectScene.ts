import Phaser from 'phaser';
import { WORLDS, WORLD } from './constants';
import { CharacterBase } from './types';

export class WorldSelectScene extends Phaser.Scene {
    players: { p1: CharacterBase | null; p2: CharacterBase | null };

    constructor() {
        super({ key: 'WorldSelectScene' });
        this.players = { p1: null, p2: null };
    }

    init(data: { p1: CharacterBase; p2: CharacterBase }) {
        this.players = data;
    }

    create() {
        // Background
        this.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 0x0f172a);

        // Title
        this.add.text(WORLD.width / 2, 60, 'SELECT LOCATION', {
            fontFamily: '"Arial Black", sans-serif',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Layout configuration
        const cols = 3;
        const startX = WORLD.width / 2 - 250;
        const startY = WORLD.height / 2 - 50;
        const gapX = 250;
        const gapY = 150;

        // Create 5 World Buttons
        WORLDS.forEach((world, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * gapX;
            const y = startY + row * gapY;

            this.createWorldButton(x, y, world.name, world.color, () => {
                this.selectWorld(world.id);
            }, world.id);
        });

        // Random Button (6th slot)
        const randomIdx = 5;
        const col = randomIdx % cols;
        const row = Math.floor(randomIdx / cols);
        const x = startX + col * gapX;
        const y = startY + row * gapY;

        this.createWorldButton(x, y, 'RANDOM', 0x94a3b8, () => {
            const randomWorld = WORLDS[Phaser.Math.Between(0, WORLDS.length - 1)];
            this.selectWorld(randomWorld.id);
        });

        // Back instruction
        this.add.text(WORLD.width / 2, WORLD.height - 50, 'Back to Characters (Not Implemented)', {
            fontSize: '14px', color: '#64748b'
        }).setOrigin(0.5);
    }

    createWorldButton(x: number, y: number, label: string, color: number, onClick: () => void, worldId?: string) {
        const container = this.add.container(x, y);
        const w = 220;
        const h = 120;

        // 1. Background (Image or Color)
        let bg: Phaser.GameObjects.GameObject;
        const previewKey = worldId ? `world_${worldId}_preview` : '';

        if (worldId && this.textures.exists(previewKey)) {
            // Use Image
            const img = this.add.image(0, 0, previewKey);
            img.setDisplaySize(w, h);
            img.setInteractive({ useHandCursor: true });
            bg = img;
            container.add(img);
        } else {
            // Use Solid Color Rectangle
            const rect = this.add.rectangle(0, 0, w, h, color);
            rect.setInteractive({ useHandCursor: true });
            bg = rect;
            container.add(rect);
        }

        // 2. Border (Separate Graphics/Shape to overlay on image)
        const border = this.add.rectangle(0, 0, w, h, 0x000000, 0); // Transparent fill
        border.setStrokeStyle(4, 0x000000);
        container.add(border);

        // 3. Text label (Stroked for visibility)
        const text = this.add.text(0, 0, label, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 200 },
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        container.add(text);

        // Interactivity
        // Note: 'bg' is the interactive object
        bg.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
            border.setStrokeStyle(4, 0xffffff);
        });

        bg.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
            border.setStrokeStyle(4, 0x000000);
        });

        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: onClick
            });
        });
    }

    selectWorld(worldId: string) {
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('MatchScene', { ...this.players, worldId });
        });
    }
}
