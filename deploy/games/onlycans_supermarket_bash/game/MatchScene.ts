import Phaser from 'phaser';
import { CharacterBase, HitPayload, MoveData } from './types';
import { WORLD, CHARACTERS, WORLDS } from './constants';
import { InputManager } from './InputManager';
import { Fighter } from './Fighter';

export class MatchScene extends Phaser.Scene {
  fixedMs: number;
  accumMs: number;
  hitstopFrames: number;
  mode: 'playing' | 'ko' | 'matchover';
  koFrames: number;
  round: number;
  p1Rounds: number;
  p2Rounds: number;
  debug: boolean;
  _prevH: boolean;
  _prevR: boolean;
  _prevEsc: boolean;
  _tmpRect: any;
  keys: any;
  p1Input: InputManager;
  p2Input: InputManager;
  p1: Fighter;
  p2: Fighter;
  ui: any;
  debugGfx: any;
  bannerText: any;
  hintText: any;
  stateText: any;
  p1Config: CharacterBase;
  p2Config: CharacterBase;
  worldId: string;
  worldConfig: any;
  parallaxLayers: Phaser.GameObjects.Image[];

  constructor() {
    super({ key: 'MatchScene' });

    // Fixed timestep
    this.fixedMs = 1000 / 60;
    this.accumMs = 0;

    // Combat "feel" tricks
    this.hitstopFrames = 0;

    // Match flow
    this.mode = 'playing'; // playing | ko | matchover
    this.koFrames = 0;

    this.round = 1;
    this.p1Rounds = 0;
    this.p2Rounds = 0;

    // Debug
    this.debug = false;
    this._prevH = false;
    this._prevR = false;
    this._prevEsc = false;

    this._tmpRect = new Phaser.Geom.Rectangle();
    this.parallaxLayers = [];

    // Defaults if loaded directly
    // Defaults if loaded directly
    this.p1Config = CHARACTERS[0];
    this.p2Config = CHARACTERS[1];

    // Default world
    this.worldId = 'aisle_1';
    this.worldConfig = WORLDS[0];
  }

  init(data: any) {
    if (data.p1) this.p1Config = data.p1;
    if (data.p2) this.p2Config = data.p2;
    if (data.worldId) {
      this.worldId = data.worldId;
      this.worldConfig = WORLDS.find(w => w.id === this.worldId) || WORLDS[0];
    }
  }

  create() {
    // Notify UI (React) about the characters
    const event = new CustomEvent('match-started', {
      detail: { p1: this.p1Config, p2: this.p2Config }
    });
    window.dispatchEvent(event);

    // Stage Background
    // Stage Background
    // Stage Background
    if (this.worldConfig.layers && this.worldConfig.layers.length > 0) {
      // Parallax Rendering
      this.worldConfig.layers.forEach((_layerUrl: string, index: number) => {
        const textureKey = `world_${this.worldId}_layer_${index}`;
        const img = this.add.image(WORLD.width / 2, WORLD.height / 2, textureKey);

        // Default "Cover" scaling
        const scaleX = WORLD.width / img.width;
        const scaleY = WORLD.height / img.height;
        let scale = Math.max(scaleX, scaleY);

        // Special handling for Layer 0 (Inside the cooler) - Fit to height to show full context
        // This is assuming Layer 0 is the "inside" content
        if (index === 0 && this.worldId === 'dairy_cooler') {
          // Use "Contain" logic or Fit Height specifically if it's a portrait image
          // effectively scale = scaleY to match screen height
          scale = scaleY;
        }

        img.setScale(scale);
        this.parallaxLayers.push(img);
      });

      // Specific Animation for Dairy Cooler
      // Indices shifted by +1 due to new background layer
      // Layer 2 (Door) and Layer 4 (Hangers) should animate
      // Original indices were 1 and 3 in the array, now they are 2 and 4
      const animLayers = [];
      if (this.parallaxLayers[2]) animLayers.push(this.parallaxLayers[2]);
      if (this.parallaxLayers[4]) animLayers.push(this.parallaxLayers[4]);

      if (animLayers.length > 0) {
        // Calculate target X
        // "Move to left until edge".
        this.tweens.add({
          targets: animLayers,
          x: '-=380', // Move left by 380px (approx 40% of screen width) to fully open
          duration: 5000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

    } else {
      // Fallback: Solid Color Background
      const bg = this.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, this.worldConfig.color);

      // Add a subtle gradient overlay to make it look nicer
      const overlay = this.add.graphics();
      overlay.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.8, 0.8);
      overlay.fillRect(0, 0, WORLD.width, WORLD.height);
    }

    // Floor area (Supermarket Aisle Floor)
    this.add.rectangle(
      WORLD.width / 2,
      WORLD.groundY + 40,
      WORLD.width,
      WORLD.height - WORLD.groundY + 120,
      0x1b2027
    );

    // Ground Line
    this.add.line(0, 0, 0, WORLD.groundY, WORLD.width, WORLD.groundY, 0x2b313a).setOrigin(0, 0);

    // Keys
    this.keys = this.input.keyboard.addKeys({
      // P1
      p1_left: 'A',
      p1_right: 'D',
      p1_jump: 'W',
      p1_attack: 'J',
      p1_block: 'K',
      p1_special: 'L',

      // P2
      p2_left: 'LEFT',
      p2_right: 'RIGHT',
      p2_jump: 'UP',
      p2_attack: 'P',
      p2_block: 'O',
      p2_special: 'I',

      // Meta
      toggleDebug: 'H',
      restart: 'R',
      menu: 'ESC'
    });

    this.p1Input = new InputManager({
      left: this.keys.p1_left,
      right: this.keys.p1_right,
      jump: this.keys.p1_jump,
      attack: this.keys.p1_attack,
      block: this.keys.p1_block,
      special: this.keys.p1_special,
    });

    this.p2Input = new InputManager({
      left: this.keys.p2_left,
      right: this.keys.p2_right,
      jump: this.keys.p2_jump,
      attack: this.keys.p2_attack,
      block: this.keys.p2_block,
      special: this.keys.p2_special,
    });

    this.p1 = new Fighter(this, {
      id: 'P1',
      characterId: this.p1Config.id,
      name: this.p1Config.name,
      x: WORLD.width * 0.28,
      y: WORLD.groundY,
      w: 130,
      h: 240,
      color: this.p1Config.color,
      moveSet: this.p1Config.moveSet,
      assets: this.p1Config.assets,
      facingRight: this.p1Config.facingRight
    });

    this.p2 = new Fighter(this, {
      id: 'P2',
      characterId: this.p2Config.id,
      name: this.p2Config.name,
      x: WORLD.width * 0.72,
      y: WORLD.groundY,
      w: 130,
      h: 240,
      color: this.p2Config.color,
      moveSet: this.p2Config.moveSet,
      assets: this.p2Config.assets,
      facingRight: this.p2Config.facingRight
    });

    // UI & Debug layers
    this.ui = this.add.graphics();
    this.debugGfx = this.add.graphics();

    this.bannerText = this.add
      .text(WORLD.width / 2, 100, '', { fontFamily: '"Courier New", monospace', fontSize: '48px', color: '#ffffff', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 })
      .setOrigin(0.5, 0.5)
      .setDepth(100);

    this.stateText = this.add
      .text(WORLD.width / 2, WORLD.height - 10, '', { fontFamily: 'monospace', fontSize: '12px', color: '#64748b' })
      .setOrigin(0.5, 1);

    // Add small instruction to return to menu
    this.add.text(10, 10, 'ESC: Menu', { fontSize: '10px', color: '#475569' });

    this.resetMatch();
  }

  resetMatch() {
    this.mode = 'playing';
    this.round = 1;

    this.p1Rounds = 0;
    this.p2Rounds = 0;

    this.hitstopFrames = 0;
    this.koFrames = 0;

    this.bannerText.setText('');

    this.p1.reset();
    this.p2.reset();

    this.drawUI();
  }

  beginRound() {
    this.mode = 'playing';
    this.hitstopFrames = 0;
    this.koFrames = 0;

    this.bannerText.setText('');

    this.p1.reset();
    this.p2.reset();
  }

  update(_time: number, deltaMs: number) {
    this.accumMs += deltaMs;

    let steps = 0;
    const maxSteps = 6;

    while (this.accumMs >= this.fixedMs && steps < maxSteps) {
      this.fixedUpdate();
      this.accumMs -= this.fixedMs;
      steps++;
    }

    // Drop backlog if the tab lagged hard.
    if (steps === maxSteps) this.accumMs = 0;
  }

  fixedUpdate() {
    // Return to menu
    const escNow = this.keys.menu.isDown;
    if (escNow && !this._prevEsc) {
      this.scene.start('MainMenuScene');
      return;
    }
    this._prevEsc = escNow;

    // Toggle debug / restart (edge-detected)
    const hNow = this.keys.toggleDebug.isDown;
    if (hNow && !this._prevH) this.debug = !this.debug;
    this._prevH = hNow;

    const rNow = this.keys.restart.isDown;
    if (rNow && !this._prevR) this.resetMatch();
    this._prevR = rNow;

    // Deterministic input sampling
    this.p1Input.poll();
    this.p2Input.poll();

    if (this.mode === 'matchover') {
      this.drawUI();
      this.drawDebug();
      this.updateStateText();
      return;
    }

    if (this.mode === 'ko') {
      this.koFrames--;
      if (this.koFrames <= 0) {
        if (this.p1Rounds >= 2 || this.p2Rounds >= 2) {
          this.mode = 'matchover';
          const winner = this.p1Rounds >= 2 ? this.p1Config.name : this.p2Config.name;
          this.bannerText.setText(`${winner.toUpperCase()} WINS!`);
        } else {
          this.round++;
          this.beginRound();
        }
      }

      this.drawUI();
      this.drawDebug();
      this.updateStateText();
      return;
    }

    // Hitstop: freeze simulation (this is the "oomph" trick)
    if (this.hitstopFrames > 0) {
      this.hitstopFrames--;
      this.drawUI();
      this.drawDebug();
      this.updateStateText();
      return;
    }

    const dt = 1 / 60;

    // Update fighters
    this.p1.updateFixed(dt, this.p1Input, this.p2, WORLD);
    this.p2.updateFixed(dt, this.p2Input, this.p1, WORLD);

    // Prevent body overlap (simple pushboxes)
    this.separateFighters();

    // Resolve attacks (after movement)
    this.resolveAttack(this.p1, this.p2, this.p2Input);
    this.resolveAttack(this.p2, this.p1, this.p1Input);

    // KO check
    if (this.p1.hp <= 0 || this.p2.hp <= 0) {
      this.handleKO();
    }

    this.drawUI();
    this.drawDebug();
    this.updateStateText();
  }

  separateFighters() {
    const a = this.p1.hurtboxRect;
    const b = this.p2.hurtboxRect;

    if (!Phaser.Geom.Intersects.RectangleToRectangle(a, b)) return;

    const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    if (overlapX <= 0) return;

    const push = overlapX / 2;

    if (this.p1.x < this.p2.x) {
      this.p1.x -= push;
      this.p2.x += push;
    } else {
      this.p1.x += push;
      this.p2.x -= push;
    }

    // Clamp after push
    const halfW = this.p1.w / 2;

    this.p1.x = Phaser.Math.Clamp(this.p1.x, halfW, WORLD.width - halfW);
    this.p2.x = Phaser.Math.Clamp(this.p2.x, halfW, WORLD.width - halfW);

    this.p1.syncVisuals();
    this.p2.syncVisuals();
    this.p1.updateBoxes();
    this.p2.updateBoxes();
  }

  resolveAttack(attacker: Fighter, defender: Fighter, defenderInput: InputManager) {
    if (!attacker.move) return;
    if (!attacker.hitboxActive) return;
    if (attacker.hasHit) return;

    const hitbox = attacker.hitboxRect;
    const hurtbox = defender.hurtboxRect;

    if (!Phaser.Geom.Intersects.RectangleToRectangle(hitbox, hurtbox)) return;

    const isBlocked = defender.isBlocking(defenderInput);

    // Find intersection center for VFX
    Phaser.Geom.Rectangle.Intersection(hitbox, hurtbox, this._tmpRect);
    const cx = this._tmpRect.centerX;
    const cy = this._tmpRect.centerY;

    const move = attacker.move;

    defender.takeHit(
      {
        damage: move.damage,
        knockbackX: move.knockback.x,
        knockbackY: move.knockback.y,
        hitstun: move.hitstun,
        hitstop: move.hitstop,
      },
      isBlocked,
      attacker.facing
    );

    attacker.hasHit = true;
    this.hitstopFrames = Math.max(this.hitstopFrames, move.hitstop);

    this.spawnHitSpark(cx, cy, isBlocked);
    this.cameras.main.shake(isBlocked ? 30 : 60, isBlocked ? 0.002 : 0.004);
  }

  spawnHitSpark(x: number, y: number, blocked: boolean) {
    const spark = this.add.circle(x, y, blocked ? 8 : 10, blocked ? 0x9aa4b2 : 0xffffff);
    spark.setDepth(50);

    this.tweens.add({
      targets: spark,
      scale: blocked ? 2.2 : 2.8,
      alpha: 0,
      duration: blocked ? 140 : 160,
      onComplete: () => spark.destroy(),
    });
  }

  handleKO() {
    let msg = 'DOUBLE KO';
    if (this.p1.hp <= 0 && this.p2.hp > 0) {
      this.p2Rounds++;
      msg = `${this.p2Config.name.toUpperCase()} WINS ROUND`;
    } else if (this.p2.hp <= 0 && this.p1.hp > 0) {
      this.p1Rounds++;
      msg = `${this.p1Config.name.toUpperCase()} WINS ROUND`;
    }

    this.mode = 'ko';
    this.koFrames = 90;

    this.bannerText.setText('KO!');

    // Swap banner after a moment
    this.time.delayedCall(350, () => {
      if (this.mode === 'ko') this.bannerText.setText(msg);
    });
  }

  drawUI() {
    this.ui.clear();

    const barW = 360;
    const barH = 18;
    const top = 20;

    const leftX = 30;
    const rightX = WORLD.width - 30 - barW;

    // Background bars
    this.ui.fillStyle(0x2b313a, 1);
    this.ui.fillRect(leftX, top, barW, barH);
    this.ui.fillRect(rightX, top, barW, barH);

    const p1Fill = Phaser.Math.Clamp(this.p1.hp / this.p1.maxHp, 0, 1);
    const p2Fill = Phaser.Math.Clamp(this.p2.hp / this.p2.maxHp, 0, 1);

    // Health fills
    this.ui.fillStyle(this.p1Config.color, 1);
    this.ui.fillRect(leftX, top, barW * p1Fill, barH);

    this.ui.fillStyle(this.p2Config.color, 1);
    this.ui.fillRect(rightX + barW * (1 - p2Fill), top, barW * p2Fill, barH);

    // Round pips
    const pipY = top + 28;
    const pipSize = 10;

    const pip = (x: number, filled: boolean) => {
      this.ui.fillStyle(filled ? 0xffffff : 0x3a424d, 1);
      this.ui.fillRect(x, pipY, pipSize, pipSize);
    };

    // P1 left pips
    pip(leftX, this.p1Rounds >= 1);
    pip(leftX + 14, this.p1Rounds >= 2);

    // P2 right pips
    pip(rightX + barW - 10, this.p2Rounds >= 1);
    pip(rightX + barW - 24, this.p2Rounds >= 2);
  }

  drawDebug() {
    this.debugGfx.clear();
    if (!this.debug) return;

    // Hurtboxes
    this.debugGfx.lineStyle(2, 0x00ff66, 1);
    this.debugGfx.strokeRectShape(this.p1.hurtboxRect);
    this.debugGfx.strokeRectShape(this.p2.hurtboxRect);

    // Hitboxes
    this.debugGfx.lineStyle(2, 0xffcc00, 1);
    if (this.p1.hitboxActive) this.debugGfx.strokeRectShape(this.p1.hitboxRect);
    if (this.p2.hitboxActive) this.debugGfx.strokeRectShape(this.p2.hitboxRect);
  }

  updateStateText() {
    this.stateText.setText(
      `Round ${this.round} | P1: ${this.p1.debugState} | P2: ${this.p2.debugState} `
    );
  }
}