// =====================================================================
// Brian's Arcade Portfolio — lobby scene
// A Phaser 3 top-down lobby where the player walks up to cabinets and
// launches embedded game projects. Phaser is loaded globally via CDN.
// =====================================================================

// -----------------------------
// PROJECT DATA (edit URLs later)
// -----------------------------
const PROJECTS = {
  onlycans: {
    title: "OnlyCANs Chronicles",
    url: "https://github.com/bmeekins93/onlycans_chronicles",
    embedUrl: "games/onlycans_chronicles/index.html",
    text: `A tongue-in-cheek brawler where expired cans fight for pantry supremacy.
Expect puns and plenty of dented egos.`
  },
  blooms: {
    title: "Blooms for Lady",
    url: "",
    embedUrl: "assets/html/coming_soon.html",
    text: `A floral boutique site with a neon twist.
Even cyberpunk mercs need to send sarcastic bouquets now and then.`
  },
  ht_docs: {
    title: "Harris Teeter Docs",
    url: "",
    embedUrl: "assets/html/coming_soon.html",
    text: `Corporate documentation turned into a retro arcade challenge.
Navigate the labyrinth of grocery lore with humor.`
  },
  kissing_kids: {
    title: "Kissing Kids",
    url: "",
    embedUrl: "games/kissing.kids/index.html",
    text: `Soothe the crying babies!
A chaotic daycare simulator.
Watch out for the police!`
  },
  pro2mussy: {
    title: "pro2mussy",
    url: "https://github.com/bmeekins93/pro2mussy",
    embedUrl: "games/pro2mussy-main/index.html",
    text: `A chaotic experiment in meme-driven development.
It is sooooooooooooooooooo dumb. You have been warned.`
  },
  bash: {
    title: "OnlyCans: Supermarket Bash",
    url: "https://github.com/bmeekins93/onlycans-supermarket-bash",
    embedUrl: "games/onlycans_supermarket_bash/dist/index.html",
    text: `The ultimate grocery store showdown.
Choose your fighter and battle for the last discount item.`
  },
  jayf: {
    title: "Jay-F Remix",
    url: "https://github.com/bmeekins93/jayF-durdayup-remix",
    embedUrl: "games/jayF-durdayup/dist/index.html",
    text: `Drop the beat with this musical remix experiment.
Rhythm, visualizers, and good vibes only.`
  },
  ygfs: {
    title: "Yum Guzzlers From Space",
    url: "https://github.com/bmeekins93/YGFS",
    text: `Defend Earth from the hungry Patricks!
Coat the invaders in delicious yum to save the planet.`
  }
};

// -----------------------------
// TUNABLE CONSTANTS
// -----------------------------
const CONSTANTS = {
  WORLD_W: 2150,
  WORLD_H: 1434,
  GRID: 32,
  PLAYER_SPEED: 460,
  PLAYER_HEIGHT: 220,
  CABINET_HEIGHT: 300,
  INTERACT_RADIUS_BASE: 260,
  INTERACT_RADIUS_TOUCH: 320,
  TYPEWRITER_MS: 12,
  // Camera zoom by smallest viewport dimension (first match wins).
  ZOOM_BREAKPOINTS: [
    { maxDim: 560, zoom: 1.35 },
    { maxDim: 820, zoom: 1.2 },
    { maxDim: 1100, zoom: 1.1 }
  ],
  ZOOM_DEFAULT: 1.0
};

// Cabinet placement around the court. Each entry maps a loaded texture key
// to a project id (see PROJECTS) and a display title.
const CABINET_LAYOUT = [
  // Top Left sideline
  { x: 420, y: 280, texture: 'cab_kissing_kids', id: 'kissing_kids', title: 'Kissing Kids' },
  { x: 630, y: 280, texture: 'cab_ht', id: 'ht_docs', title: 'Harris Teeter Docs' },
  // Top Right sideline
  { x: 1470, y: 280, texture: 'cab_blooms', id: 'blooms', title: 'Blooms for Lady' },
  { x: 1680, y: 280, texture: 'cab_onlycans', id: 'onlycans', title: 'OnlyCANs Chronicles' },
  // Bottom Left sideline
  { x: 420, y: 1120, texture: 'cab_pro2mussy', id: 'pro2mussy', title: 'pro2mussy' },
  { x: 630, y: 1120, texture: 'cab_bash', id: 'bash', title: 'OnlyCans: Supermarket Bash' },
  // Bottom Right sideline
  { x: 1470, y: 1120, texture: 'cab_jayf', id: 'jayf', title: 'Jay-F Remix' },
  { x: 1680, y: 1120, texture: 'cab_ygfs', id: 'ygfs', title: 'Yum Guzzlers From Space' }
];

const WORLD_W = CONSTANTS.WORLD_W;
const WORLD_H = CONSTANTS.WORLD_H;
const GRID = CONSTANTS.GRID;

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
document.body.classList.toggle('touch', isTouchDevice);

let interactRadius = CONSTANTS.INTERACT_RADIUS_BASE;

// -----------------------------
// PHASER CONFIG
// -----------------------------
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0b0b14',
  parent: 'game-container',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  pixelArt: true,
  render: { roundPixels: true },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, cursors, wasd, cabinets, interactKey, spaceKey;
let promptText;
let activeCabinet = null;
let isInputLocked = false;
let isOrientationBlocked = false;
let touchVector = { x: 0, y: 0 };
let touchMagnitude = 0;
let joystickPointerId = null;
let isJoystickActive = false;
let joystickCenter = { x: 0, y: 0 };
let joystickRadius = 0;
const promptLabel = isTouchDevice ? "PRESS A" : "PRESS E / SPACE";
if (isTouchDevice) {
  interactRadius = CONSTANTS.INTERACT_RADIUS_TOUCH;
}
const hud = document.getElementById('hud');
const modalHint = document.getElementById('modal-hint');
const touchControls = document.getElementById('touch-controls');
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
const actionButton = document.getElementById('action-button');
const rotateOverlay = document.getElementById('rotate-overlay');

function isInputBlocked() {
  return isInputLocked || isOrientationBlocked;
}

function getPointerId(eventLike) {
  if (!eventLike) return null;
  if (typeof eventLike.pointerId === 'number') return eventLike.pointerId;
  if (typeof eventLike.id === 'number') return eventLike.id;
  if (typeof eventLike.identifier === 'number') return eventLike.identifier;
  return null;
}

function isJoystickPointer(pointer) {
  if (!isTouchDevice || !isJoystickActive) return false;
  if (joystickPointerId === null) return true;
  const pid = getPointerId(pointer);
  if (pid === null) return true;
  return pid === joystickPointerId;
}

function updateInputHints() {
  if (hud) {
    hud.textContent = isTouchDevice
      ? "JOYSTICK: MOVE • A: INTERACT • TAP CABINET: FOCUS"
      : "WASD / Arrows: move • E / Space: interact • Enter: launch • Esc: close";
  }
  if (modalHint) {
    modalHint.textContent = isTouchDevice
      ? "[A: INTERACT • ENTER: LAUNCH • TAP X: CLOSE]"
      : "[E/SPACE: INTERACT • ENTER: LAUNCH • ESC: CLOSE]";
  }
}

function updateOrientationLock() {
  const isPortrait = window.innerHeight > window.innerWidth;
  isOrientationBlocked = isTouchDevice && isPortrait;
  document.body.classList.toggle('portrait', isOrientationBlocked);
  if (rotateOverlay) {
    rotateOverlay.setAttribute('aria-hidden', isOrientationBlocked ? "false" : "true");
  }
}

function getResponsiveZoom() {
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  for (const bp of CONSTANTS.ZOOM_BREAKPOINTS) {
    if (minDim < bp.maxDim) return bp.zoom;
  }
  return CONSTANTS.ZOOM_DEFAULT;
}

function applyResponsiveCamera(scene) {
  if (!scene || !scene.cameras || !scene.cameras.main) return;
  scene.cameras.main.setZoom(getResponsiveZoom());
}

function resetJoystick() {
  if (!joystickKnob) return;
  joystickKnob.style.transform = "translate(-50%, -50%)";
  touchVector = { x: 0, y: 0 };
  touchMagnitude = 0;
}

function updateJoystickLayout() {
  if (!joystickBase) return;
  const rect = joystickBase.getBoundingClientRect();
  joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  joystickRadius = rect.width / 2;
  resetJoystick();
}

function updateJoystick(clientX, clientY) {
  if (!joystickBase || !joystickKnob) return;
  const dx = clientX - joystickCenter.x;
  const dy = clientY - joystickCenter.y;
  const dist = Math.hypot(dx, dy);
  const max = joystickRadius * 0.6;
  const clamped = Math.min(dist, max);
  const angle = Math.atan2(dy, dx);
  const offsetX = Math.cos(angle) * clamped;
  const offsetY = Math.sin(angle) * clamped;

  joystickKnob.style.transform =
    "translate(calc(-50% + " + offsetX + "px), calc(-50% + " + offsetY + "px))";

  if (dist > 0 && max > 0) {
    touchVector.x = dx / dist;
    touchVector.y = dy / dist;
    touchMagnitude = Math.min(dist / max, 1);
  } else {
    touchVector.x = 0;
    touchVector.y = 0;
    touchMagnitude = 0;
  }
}

updateInputHints();
updateOrientationLock();
if (touchControls) {
  touchControls.setAttribute('aria-hidden', isTouchDevice ? "false" : "true");
}

if (isTouchDevice && joystickBase) {
  joystickBase.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (isInputBlocked()) return;
    const pid = getPointerId(ev);
    joystickPointerId = pid;
    isJoystickActive = true;
    if (typeof pid === 'number' && joystickBase.setPointerCapture) {
      joystickBase.setPointerCapture(pid);
    }
    updateJoystick(ev.clientX, ev.clientY);
  });

  joystickBase.addEventListener('pointermove', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const pid = getPointerId(ev);
    if (joystickPointerId !== null && pid !== joystickPointerId) return;
    updateJoystick(ev.clientX, ev.clientY);
  });

  const endJoystick = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const pid = getPointerId(ev);
    if (joystickPointerId !== null && pid !== joystickPointerId) return;
    joystickPointerId = null;
    isJoystickActive = false;
    resetJoystick();
    if (typeof pid === 'number' && joystickBase.hasPointerCapture && joystickBase.hasPointerCapture(pid)) {
      joystickBase.releasePointerCapture(pid);
    }
  };

  joystickBase.addEventListener('pointerup', endJoystick);
  joystickBase.addEventListener('pointercancel', endJoystick);
  joystickBase.addEventListener('pointerleave', endJoystick);
}

if (isTouchDevice && actionButton) {
  actionButton.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    if (isInputBlocked()) return;
    triggerInteract();
  });
}

function preload() {
  // WebP assets (q90, ~6x smaller than the original PNGs, same vibe)
  this.load.image('player', 'assets/sprites/brian_sprite.webp?v=3');
  this.load.image('cab_onlycans', 'assets/cabinets/onlycans_cabinet.webp?v=8');
  this.load.image('cab_blooms', 'assets/cabinets/blooms_cabinet.webp?v=3');
  this.load.image('cab_ht', 'assets/cabinets/ht_cabinet.webp?v=3');
  this.load.image('cab_kissing_kids', 'assets/cabinets/Kissing.kids_cabinet.webp?v=2');
  this.load.image('cab_pro2mussy', 'assets/cabinets/pro2mussy_cabinet.webp?v=4');
  this.load.image('cab_bash', 'assets/cabinets/bash_cabinet.webp?v=3');
  this.load.image('cab_jayf', 'assets/cabinets/jayf_cabinet.webp?v=5');
  this.load.image('cab_ygfs', 'assets/cabinets/ygfs_cabinet.webp?v=3');

  // Basketball Court Background
  this.load.image('bg_court', 'assets/backgrounds/Bball_crt_background.webp');
  this.load.image('jumbotron', 'assets/sprites/jumbotron.webp');

  // Audio
  this.load.audio('bgm', 'assets/audio/pats_theme.mp3');
}

function create() {
  // 1) Basketball Court Background
  this.bgCourt = this.add.image(0, 0, 'bg_court')
    .setOrigin(0, 0)
    .setDepth(-3);

  this.bgCourt.displayWidth = WORLD_W;
  this.bgCourt.displayHeight = WORLD_H;

  // 2) World bounds (so you can roam)
  this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
  this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

  // 2.5) Jumbotron Frame (static decorative bezel)
  const jumbotronContainer = this.add.container(WORLD_W / 1.98, 80);
  jumbotronContainer.setDepth(-2.42);
  jumbotronContainer.setScale(0.45);

  const frame = this.add.image(0.5, 0.08, 'jumbotron');
  frame.setOrigin(0.5, 0.06);
  jumbotronContainer.add(frame);

  // 3) Cabinets (positions defined in CABINET_LAYOUT)
  cabinets = this.physics.add.staticGroup();
  CABINET_LAYOUT.forEach((c) => {
    createCabinet(this, cabinets, c.x, c.y, c.texture, c.id, c.title);
  });

  // 4) Player
  player = this.physics.add.sprite(1050, 700, 'player');

  const pImg = this.textures.get('player').getSourceImage();
  player.setScale(CONSTANTS.PLAYER_HEIGHT / pImg.height);

  // Tighter collider so you don't feel like you're bumping invisible air
  player.body.setSize(player.displayWidth * 0.55, player.displayHeight * 0.75, true);
  player.body.setOffset(player.displayWidth * 0.225, player.displayHeight * 0.25);

  player.setCollideWorldBounds(true);

  // 5) Camera follow
  this.cameras.main.startFollow(player, true, 0.12, 0.12);
  applyResponsiveCamera(this);

  // 6) Inputs
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys('W,A,S,D');
  interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 7) Collide with cabinets (no auto-open)
  this.physics.add.collider(player, cabinets);

  // 8) Interaction prompt (appears when near a cabinet)
  promptText = this.add.text(0, 0, promptLabel, {
    fontFamily: "Courier New, monospace",
    fontSize: isTouchDevice ? "16px" : "14px",
    color: "#00ff7a",
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: { left: 8, right: 8, top: 4, bottom: 4 }
  })
    .setOrigin(0.5, 1)
    .setDepth(10000)
    .setVisible(false);

  promptText.setShadow(0, 0, "#00ff7a", 10, false, true);

  updateOrientationLock();
  updateJoystickLayout();

  // 9) Background Music
  this.sound.pauseOnBlur = false;
  const bgm = this.sound.add('bgm', {
    loop: true,
    volume: 0.4
  });
  // Try to play immediately (browser autoplay policy might block this until interaction)
  bgm.play();

  this.registry.set('bgm', bgm);

  // Keep scaling/canvas responsive (resize + orientationchange share one handler)
  const handleViewportChange = () => {
    this.scale.resize(window.innerWidth, window.innerHeight);
    applyResponsiveCamera(this);
    updateOrientationLock();
    updateJoystickLayout();
  };
  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('orientationchange', handleViewportChange);

  // Global click listener to resume context if blocked
  this.input.on('pointerdown', () => {
    if (this.sound.context.state === 'suspended') {
      this.sound.context.resume();
    }
  });
}

function createCabinet(scene, group, x, y, texture, id, title) {
  const cab = group.create(x, y, texture);

  // Scale cabinet to a consistent visual height
  const img = scene.textures.get(texture).getSourceImage();
  cab.setScale(CONSTANTS.CABINET_HEIGHT / img.height);

  // Depth sort by y (simple top-down layering)
  cab.setDepth(cab.y);

  cab.setData('id', id);
  cab.setData('title', title);

  // Shrink cabinet collider to the lower half so the top doesn't block movement
  cab.refreshBody();
  if (cab.body) {
    const bw = cab.displayWidth * 0.62;
    const bh = cab.displayHeight * 0.42;
    cab.body.setSize(bw, bh, true);
    cab.body.setOffset((cab.displayWidth - bw) / 2, cab.displayHeight - bh);
  }

  // Subtle "interaction ring" that we toggle on/off
  cab._highlight = scene.add.ellipse(
    cab.x,
    cab.y + cab.displayHeight * 0.44,
    cab.displayWidth * 0.75,
    cab.displayWidth * 0.26,
    0x00ff7a,
    0.16
  ).setDepth(cab.depth - 1).setVisible(false);

  // Click/tap support: click the cabinet to focus it, click again (or press E) to open
  cab.setInteractive({ useHandCursor: true });
  cab.on('pointerdown', (pointer) => {
    if (isInputBlocked()) return;
    if (isJoystickPointer(pointer)) return;
    const d = Phaser.Math.Distance.Between(player.x, player.y, cab.x, cab.y);
    if (d <= interactRadius) {
      attemptOpenCabinet(cab);
    } else {
      setActiveCabinet(cab);
    }
  });

  return cab;
}

function setActiveCabinet(cab) {
  if (activeCabinet === cab) return;

  if (activeCabinet && activeCabinet._highlight) activeCabinet._highlight.setVisible(false);

  activeCabinet = cab;

  if (activeCabinet && activeCabinet._highlight) activeCabinet._highlight.setVisible(true);
}

function attemptOpenCabinet(cab) {
  if (!cab || isInputBlocked()) return;

  const pid = cab.getData('id');
  const title = cab.getData('title');

  // Dispatch event for DOM UI
  window.dispatchEvent(new CustomEvent('enter-cabinet', {
    detail: { id: pid, title }
  }));

  // Lock movement while modal is open
  isInputLocked = true;
  promptText.setVisible(false);

  // Micro push away so you're not glued to the cabinet
  const dx = player.x - cab.x;
  const dy = player.y - cab.y;
  const len = Math.hypot(dx, dy) || 1;
  player.x += (dx / len) * 10;
  player.y += (dy / len) * 10;
  player.body.reset(player.x, player.y);
}

function update() {
  // Depth sort the player each frame
  if (player) player.setDepth(player.y);

  // Freeze input while modal open
  if (isInputBlocked()) {
    player.body.setVelocity(0);
    promptText.setVisible(false);
    return;
  }

  // Movement
  const speed = CONSTANTS.PLAYER_SPEED;
  player.body.setVelocity(0);

  const left = cursors.left.isDown || wasd.A.isDown;
  const right = cursors.right.isDown || wasd.D.isDown;
  const up = cursors.up.isDown || wasd.W.isDown;
  const down = cursors.down.isDown || wasd.S.isDown;

  const usingKeyboard = left || right || up || down;
  let vx = 0;
  let vy = 0;

  if (usingKeyboard) {
    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;
  } else if (isTouchDevice && touchMagnitude > 0) {
    vx = touchVector.x * touchMagnitude;
    vy = touchVector.y * touchMagnitude;
  }

  if (vx !== 0 || vy !== 0) {
    const len = Math.hypot(vx, vy) || 1;
    player.body.setVelocity((vx / len) * speed, (vy / len) * speed);
  }

  // Check cabinet proximity
  const nearestCab = getNearestCabinetInRange();

  if (nearestCab) {
    setActiveCabinet(nearestCab);
    promptText.setText(promptLabel);
    promptText.setPosition(
      activeCabinet.x,
      activeCabinet.y - activeCabinet.displayHeight * 0.53
    );
    promptText.setVisible(true);

    if (Phaser.Input.Keyboard.JustDown(interactKey) || Phaser.Input.Keyboard.JustDown(spaceKey)) {
      attemptOpenCabinet(activeCabinet);
    }
  } else {
    setActiveCabinet(null);
    promptText.setVisible(false);
  }
}

function getNearestCabinetInRange() {
  if (!cabinets || !player) return null;
  let nearest = null;
  let nearestDist = Infinity;

  cabinets.getChildren().forEach((cab) => {
    const d = Phaser.Math.Distance.Between(player.x, player.y, cab.x, cab.y);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = cab;
    }
  });

  if (nearest && nearestDist <= interactRadius) return nearest;
  return null;
}

function triggerInteract() {
  if (isInputBlocked()) return;

  const cab = getNearestCabinetInRange();
  if (cab) {
    attemptOpenCabinet(cab);
  }
}

// -----------------------------
// UI MODAL LOGIC
// -----------------------------
const uiLayer = document.getElementById('ui-layer');
const modalContent = document.getElementById('modal-content');
const modalTitle = document.getElementById('modal-title');
const closeBtn = document.getElementById('modal-close');
const openBtn = document.getElementById('modal-open');

// Embed UI refs
const embedOverlay = document.getElementById('game-embed-overlay');
const embedIframe = document.getElementById('embed-iframe');
const embedTitle = document.getElementById('embed-title');
const closeEmbedBtn = document.getElementById('close-embed-btn');
let isEmbedded = false;

// We'll access the BGM via the Phaser game instance
function getBGM() {
  if (game && game.registry) {
    return game.registry.get('bgm');
  }
  return null;
}

let typeTimer = null;
let audioCtx = null;
let audioEnabled = true;

function beep(freq = 880, duration = 0.07, gain = 0.035) {
  if (!audioEnabled) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.value = gain;

    o.connect(g);
    g.connect(audioCtx.destination);

    o.start();
    o.stop(audioCtx.currentTime + duration);
  } catch (_) { }
}

function typewrite(text) {
  if (typeTimer) clearInterval(typeTimer);
  modalContent.textContent = "";
  let i = 0;

  typeTimer = setInterval(() => {
    modalContent.textContent += text[i] || "";
    i++;
    if (i >= text.length) {
      clearInterval(typeTimer);
      typeTimer = null;
    }
  }, CONSTANTS.TYPEWRITER_MS);
}

function closeModal() {
  uiLayer.style.display = 'none';

  if (typeTimer) {
    clearInterval(typeTimer);
    typeTimer = null;
  }

  beep(420, 0.06);

  // Small delay prevents immediate re-trigger
  setTimeout(() => {
    if (!isEmbedded) isInputLocked = false;
  }, 90);
}

// EMBED LOGIC
function openEmbeddedGame(title, url) {
  if (!url) return;

  // Close the modal first
  uiLayer.style.display = 'none';
  if (typeTimer) clearInterval(typeTimer);

  isEmbedded = true;
  isInputLocked = true; // Ensure locked

  embedTitle.textContent = "RUNNING: " + title;
  embedIframe.src = url;
  embedOverlay.style.display = 'flex';

  // Pause arcade BGM
  const bgm = getBGM();
  if (bgm && bgm.isPlaying) {
    bgm.pause();
  }
}

function closeEmbeddedGame() {
  embedOverlay.style.display = 'none';
  embedIframe.src = ""; // Stop execution/audio
  isEmbedded = false;

  // Resume arcade BGM
  const bgm = getBGM();
  if (bgm && bgm.isPaused && audioEnabled) {
    bgm.resume();
  }

  // Return control to arcade
  // Add small delay to prevent immediate movement
  setTimeout(() => {
    isInputLocked = false;
  }, 100);
}

closeEmbedBtn.addEventListener('click', closeEmbeddedGame);

closeBtn.addEventListener('click', closeModal);

// Click outside the modal closes it
uiLayer.addEventListener('pointerdown', (ev) => {
  if (ev.target === uiLayer) closeModal();
});

window.addEventListener('keydown', (ev) => {
  // ESC closes
  if (ev.key === 'Escape') {
    if (isEmbedded) {
      closeEmbeddedGame();
      return;
    }
    if (uiLayer.style.display === 'flex') {
      closeModal();
      return;
    }
  }

  // ENTER launches (when available)
  if (ev.key === 'Enter' && uiLayer.style.display === 'flex') {
    // If the launch button is enabled, trigger its click handler
    if (openBtn.style.pointerEvents !== 'none') {
      openBtn.click();
    }
  }

  // M toggles audio
  if (ev.key.toLowerCase() === 'm') {
    audioEnabled = !audioEnabled;
    const bgm = getBGM();
    if (bgm) {
      // If we are embedded, don't resume, just update state tracking
      bgm.mute = !audioEnabled;
    }
  }
});

window.addEventListener('enter-cabinet', (e) => {
  const projectId = e.detail.id;

  const p = PROJECTS[projectId] || {
    title: e.detail.title || "UNKNOWN CABINET",
    url: "",
    text: "Unknown project: the mystery cabinet whispers insults about your coding habits."
  };

  modalTitle.textContent = (p.title || "").toUpperCase();

  // Link handling — reset listeners via onclick
  openBtn.onclick = (ev) => {
    if (p.embedUrl) {
      ev.preventDefault();
      beep(980, 0.05);
      openEmbeddedGame(p.title, p.embedUrl);
    } else {
      // Default behavior (link): allow the href to open
      beep(980, 0.05);
    }
  };

  if ((p.url && p.url.trim().length > 0) || p.embedUrl) {
    openBtn.href = p.url || "#"; // Fallback to hash if only embedUrl is present
    openBtn.style.opacity = "1";
    openBtn.style.pointerEvents = "auto";
  } else {
    openBtn.href = "#";
    openBtn.style.opacity = "0.35";
    openBtn.style.pointerEvents = "none";
  }

  uiLayer.style.display = 'flex';
  beep(880, 0.06);
  typewrite(p.text || "");
});
