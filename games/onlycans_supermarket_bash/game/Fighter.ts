import { FighterOptions, HitPayload, MoveData, FighterAssets } from './types';
import Phaser from 'phaser';
import { MOVES, totalFrames } from './moves';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const approach = (v: number, target: number, delta: number) => {
  if (v < target) return Math.min(v + delta, target);
  if (v > target) return Math.max(v - delta, target);
  return target;
};

export class Fighter {
  scene: any;
  id: string;
  characterId: string;
  color: number;
  spawnX: number;
  spawnY: number;
  x: number;
  y: number;
  w: number;
  h: number;
  obj: any; // Sprite or Rectangle
  nameText: any;
  facing: number;
  maxHp: number;
  hp: number;
  velX: number;
  velY: number;
  onGround: boolean;
  state: 'idle' | 'run' | 'air' | 'attack' | 'hitstun' | 'blockstun' | 'block';
  actionFrame: number;
  hitstunFrames: number;
  blockstunFrames: number;
  buffer: { jump: number; attack: number; special: number;[key: string]: number };
  bufferMax: number;
  move: MoveData | null;
  moveSet: { jab: string; special: string };
  assets?: FighterAssets;
  currentMoveType: 'jab' | 'special' | null;
  hurtboxRect: any;
  hitboxRect: any;
  hitboxActive: boolean;
  hasHit: boolean;
  debugState: string;
  hasAtlas: boolean;
  initialFacingRight: boolean;

  constructor(scene: any, opts: FighterOptions) {
    this.scene = scene;

    this.id = opts.id;
    this.characterId = opts.characterId;
    this.color = opts.color ?? 0xffffff;
    this.initialFacingRight = opts.facingRight ?? true;

    this.spawnX = opts.x;
    this.spawnY = opts.y;

    // Position is the "feet" point (bottom-center).
    this.x = opts.x;
    this.y = opts.y;

    this.w = opts.w ?? 48;
    this.h = opts.h ?? 96;

    // Default moves if none provided (fallback)
    this.moveSet = opts.moveSet ?? { jab: 'jason_jab', special: 'jason_special' };
    this.assets = opts.assets;
    this.currentMoveType = null;

    // Determine if we can use sprite assets (Atlas or individual)
    // If atlas is used, the texture key matches the characterId (created in PreloadScene)
    this.hasAtlas = scene.textures.exists(this.characterId);
    let useSprite = this.hasAtlas;

    if (!useSprite && this.assets) {
      // Check if the primary idle texture was successfully loaded (legacy method)
      // Check using characterId prefix first, fallback to just asset key logic if needed
      if (scene.textures.exists(`${this.characterId}_idle`)) {
        useSprite = true;
      } else {
        console.warn(`Assets defined for ${this.characterId} but texture '${this.characterId}_idle' missing. Falling back to rectangle.`);
      }
    }

    // Create Sprite or Rectangle
    if (useSprite) {
      // Start with idle
      const textureKey = this.hasAtlas ? this.characterId : `${this.characterId}_idle`;
      const frameKey = this.hasAtlas ? this.assets?.idle : undefined;

      this.obj = scene.add.sprite(this.x, this.y, textureKey, frameKey).setOrigin(0.5, 1);

      // Force scale to match hit box height while maintaining aspect ratio
      this.obj.displayHeight = this.h;
      this.obj.scaleX = this.obj.scaleY; // Uniform scale
    } else {
      this.obj = scene.add
        .rectangle(this.x, this.y, this.w, this.h, this.color)
        .setOrigin(0.5, 1);
    }

    this.nameText = scene.add
      .text(this.x, this.y - this.h - 18, opts.name ?? this.id, {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#eaeaea',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5, 1);

    this.facing = 1;

    this.maxHp = 100;
    this.hp = this.maxHp;

    this.velX = 0;
    this.velY = 0;
    this.onGround = true;

    this.state = 'idle';
    this.actionFrame = 0;

    this.hitstunFrames = 0;
    this.blockstunFrames = 0;

    // Tiny input buffer to make things feel snappy.
    this.buffer = { jump: 0, attack: 0, special: 0 };
    this.bufferMax = 6; // frames

    this.move = null;

    this.hurtboxRect = new Phaser.Geom.Rectangle(0, 0, this.w, this.h);
    this.hitboxRect = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    this.hitboxActive = false;
    this.hasHit = false;

    this.debugState = '';
  }

  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;

    this.velX = 0;
    this.velY = 0;

    this.onGround = true;

    this.state = 'idle';
    this.actionFrame = 0;

    this.hitstunFrames = 0;
    this.blockstunFrames = 0;

    this.buffer.jump = 0;
    this.buffer.attack = 0;
    this.buffer.special = 0;

    this.move = null;
    this.currentMoveType = null;
    this.hitboxActive = false;
    this.hasHit = false;

    this.hp = this.maxHp;

    this.syncVisuals();
    this.updateBoxes();
  }

  canAct() {
    return this.hitstunFrames <= 0 && this.blockstunFrames <= 0 && this.state !== 'attack';
  }

  isBlocking(input: any) {
    return (
      this.blockstunFrames <= 0 &&
      this.hitstunFrames <= 0 &&
      this.onGround &&
      input.pressed('block') &&
      this.state !== 'attack'
    );
  }

  startMove(type: 'jab' | 'special') {
    this.state = 'attack';
    this.currentMoveType = type;

    // Lookup specific move from moveSet
    const moveKey = this.moveSet[type];
    this.move = MOVES[moveKey];

    this.actionFrame = 0;

    this.hitboxActive = false;
    this.hasHit = false;
  }

  takeHit(payload: HitPayload, isBlocked: boolean, attackerFacing: number) {
    const { damage, knockbackX, knockbackY, hitstun } = payload;

    if (isBlocked) {
      const chip = Math.max(1, Math.floor(damage * 0.25));
      this.hp = Math.max(0, this.hp - chip);

      this.blockstunFrames = Math.max(this.blockstunFrames, Math.floor(hitstun * 0.65));

      // Pushback on block (smaller)
      this.velX = attackerFacing * knockbackX * 0.35;
      this.velY = Math.min(this.velY, -knockbackY * 0.05);

      this.state = 'block';
      this.actionFrame = 0;

      return { blocked: true, amount: chip };
    }

    this.hp = Math.max(0, this.hp - damage);

    this.hitstunFrames = Math.max(this.hitstunFrames, hitstun);
    this.blockstunFrames = 0;

    this.velX = attackerFacing * knockbackX;
    this.velY = -knockbackY;

    this.onGround = false;
    this.state = 'hitstun';
    this.actionFrame = 0;

    return { blocked: false, amount: damage };
  }

  updateFixed(dt: number, input: any, opponent: Fighter, world: any) {
    // Simple v1 rule: always face your opponent.
    this.facing = opponent.x >= this.x ? 1 : -1;

    // --- input buffer ticking ---
    const tick = (k: string) => {
      if (this.buffer[k] > 0) this.buffer[k]--;
    };
    tick('jump');
    tick('attack');
    tick('special');

    if (input.justPressed('jump')) this.buffer.jump = this.bufferMax;
    if (input.justPressed('attack')) this.buffer.attack = this.bufferMax;
    if (input.justPressed('special')) this.buffer.special = this.bufferMax;

    // --- stun timers ---
    if (this.hitstunFrames > 0) this.hitstunFrames--;
    if (this.blockstunFrames > 0) this.blockstunFrames--;

    // --- state from stun ---
    if (this.hitstunFrames > 0) {
      this.state = 'hitstun';
    } else if (this.blockstunFrames > 0) {
      this.state = 'blockstun';
    } else if (this.state === 'hitstun' || this.state === 'blockstun') {
      this.state = 'idle';
      this.actionFrame = 0;
    }

    const blocking = this.isBlocking(input);

    // --- attack state ---
    if (this.state === 'attack' && this.move) {
      const move = this.move;
      const total = totalFrames(move);
      const f = this.actionFrame;

      const activeStart = move.startup;
      const activeEnd = move.startup + move.active;

      this.hitboxActive = f >= activeStart && f < activeEnd;

      if (this.hitboxActive) {
        const cx = this.x + this.facing * move.hitbox.ox;
        const cy = this.y + move.hitbox.oy;

        this.hitboxRect.x = cx - move.hitbox.w / 2;
        this.hitboxRect.y = cy - move.hitbox.h / 2;
        this.hitboxRect.width = move.hitbox.w;
        this.hitboxRect.height = move.hitbox.h;
      }

      // Tiny drift during attacks so it doesn't feel glued down.
      const drift = 0.15;
      this.velX = approach(this.velX, input.axisX * world.moveSpeed * drift, world.groundAccel * dt);

      this.actionFrame++;
      if (this.actionFrame >= total) {
        this.state = 'idle';
        this.move = null;
        this.currentMoveType = null;
        this.actionFrame = 0;

        this.hitboxActive = false;
        this.hasHit = false;
      }
    } else if (blocking) {
      this.state = 'block';
      this.velX = approach(this.velX, 0, world.friction * dt);

      this.actionFrame = 0;
      this.hitboxActive = false;
      this.move = null;
      this.currentMoveType = null;
    } else if (this.hitstunFrames > 0 || this.blockstunFrames > 0) {
      // No control in stun.
    } else {
      // --- normal movement ---
      const axis = input.axisX;
      const max = this.onGround ? world.moveSpeed : world.airSpeed;
      const accel = this.onGround ? world.groundAccel : world.airAccel;

      if (axis !== 0) {
        this.velX = approach(this.velX, axis * max, accel * dt);
        this.state = this.onGround ? 'run' : 'air';
      } else {
        this.velX = approach(this.velX, 0, world.friction * dt);
        this.state = this.onGround ? 'idle' : 'air';
      }

      // Jump if buffered
      if (this.buffer.jump > 0 && this.onGround) {
        this.buffer.jump = 0;
        this.onGround = false;
        this.velY = -world.jumpSpeed;
        this.state = 'air';
      }

      // Ground attacks
      if (this.onGround && this.canAct()) {
        if (this.buffer.special > 0) {
          this.buffer.special = 0;
          this.startMove('special');
        } else if (this.buffer.attack > 0) {
          this.buffer.attack = 0;
          this.startMove('jab');
        }
      } else if (!this.onGround && this.canAct()) {
        // For now: allow air special only.
        if (this.buffer.special > 0) {
          this.buffer.special = 0;
          this.startMove('special');
        }
      }
    }

    // --- gravity / integration ---
    this.velY = clamp(this.velY + world.gravity * dt, -world.jumpSpeed * 2, world.maxFall);

    this.x += this.velX * dt;
    this.y += this.velY * dt;

    // --- bounds / ground ---
    const halfW = this.w / 2;

    if (this.x < halfW) {
      this.x = halfW;
      this.velX = 0;
    }
    if (this.x > world.width - halfW) {
      this.x = world.width - halfW;
      this.velX = 0;
    }

    if (this.y >= world.groundY) {
      this.y = world.groundY;
      this.velY = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // Clear hitbox when not active
    if (!this.hitboxActive) {
      this.hitboxRect.width = 0;
      this.hitboxRect.height = 0;
    }

    this.updateBoxes();
    this.syncVisuals();

    // Debug label
    const st =
      this.hitstunFrames > 0
        ? `HIT(${this.hitstunFrames})`
        : this.blockstunFrames > 0
          ? `BLK(${this.blockstunFrames})`
          : this.state.toUpperCase();

    this.debugState = st;
  }

  updateBoxes() {
    this.hurtboxRect.x = this.x - this.w / 2;
    this.hurtboxRect.y = this.y - this.h;
    this.hurtboxRect.width = this.w;
    this.hurtboxRect.height = this.h;
  }

  syncVisuals() {
    // Update visual position
    this.obj.x = this.x;
    this.obj.y = this.y;

    this.nameText.x = this.x;
    this.nameText.y = this.y - this.h - 6;

    // Determine target key/frame
    if (this.assets && this.obj.setTexture && this.obj.setFrame) {
      let assetKey = this.assets.idle;

      if (this.state === 'run') {
        assetKey = this.assets.run;
      } else if (this.state === 'air') {
        assetKey = this.assets.jump;
      } else if (this.state === 'block' || this.state === 'blockstun') {
        assetKey = this.assets.block;
      } else if (this.state === 'attack') {
        if (this.currentMoveType === 'special') {
          assetKey = this.assets.special;
        } else {
          assetKey = this.assets.jab;
        }
      } else if (this.state === 'hitstun') {
        // Fallback to idle if no hitstun image
        assetKey = this.assets.idle;
      }

      // Check existence based on Atlas mode vs Single Image mode
      if (this.hasAtlas) {
        // In Atlas mode, 'assetKey' is the frame name (e.g. "Jason_standingstill-1.png")
        // The texture key is this.characterId (e.g. "jason")
        this.obj.setFrame(assetKey);
      } else {
        // In Single Image mode, the texture key is implicitly constructed (e.g. "jason_idle")
        // However, the original logic constructed keys like `${this.characterId}_idle`.
        // We need to map the assetKey (URL in legacy mode) back to the ID we registered in Preload.
        // This is a bit tricky since we stored URLs in this.assets for legacy chars.
        // Let's rely on the state-based key construction for legacy chars:

        let legacyKey = `${this.characterId}_idle`;
        if (this.state === 'run') legacyKey = `${this.characterId}_run`;
        else if (this.state === 'air') legacyKey = `${this.characterId}_jump`;
        else if (this.state === 'block' || this.state === 'blockstun') legacyKey = `${this.characterId}_block`;
        else if (this.state === 'attack') legacyKey = this.currentMoveType === 'special' ? `${this.characterId}_special` : `${this.characterId}_jab`;

        if (this.scene.textures.exists(legacyKey)) {
          this.obj.setTexture(legacyKey);
        }
      }

      // Enforce height consistency when swapping textures/frames
      this.obj.displayHeight = this.h;
      this.obj.scaleX = this.obj.scaleY;

      // Flip based on facing
      // facing: 1 = right, -1 = left.
      // If initialFacingRight is true (standard):
      //    facing 1 (Right) -> flipX = false
      //    facing -1 (Left) -> flipX = true
      // If initialFacingRight is false (David):
      //    facing 1 (Right) -> flipX = true (to flip the Left-facing sprite to Right)
      //    facing -1 (Left) -> flipX = false (show original Left-facing sprite)

      const isFacingLeft = this.facing === -1;
      const shouldFlip = this.initialFacingRight ? isFacingLeft : !isFacingLeft;

      this.obj.setFlipX(shouldFlip);
    }
  }
}