/* game.js — engine/runtime.
   Everything here is "mechanics". Story lives in story.js.
*/
(() => {
  "use strict";

  // Global error handler to help debug "assets not loading" issues
  window.addEventListener("error", (e) => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "Error: " + (e.message || e);
      toast.classList.add("is-visible");
      console.error(e);
    }
  });

  // ---------- Utilities ----------
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const $ = (sel) => document.querySelector(sel);

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderMarkdown(md) {
    const escaped = escapeHtml(md);
    const bold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return bold.replace(/\n/g, "<br>");
  }

  function stripMarkdown(md) {
    return String(md).replace(/\*\*(.+?)\*\*/g, "$1");
  }

  function safePlay(audio) {
    if (!audio) return;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => { /* ignore autoplay blocks */ });
    }
  }

  // ---------- DOM ----------
  const dom = {
    root: $("#app"),
    canvas: $("#fxCanvas"),
    bgVideo: $("#bgVideo"),

    screenMenu: $("#mainMenu"),
    screenGame: $("#gameScreen"),

    btnStart: $("#btnStart"),
    btnSettings: $("#btnSettings"),
    btnCredits: $("#btnCredits"),

    btnPause: $("#btnPause"),

    pauseOverlay: $("#pauseOverlay"),
    btnResume: $("#btnResume"),
    btnPauseSettings: $("#btnPauseSettings"),
    btnMainMenu: $("#btnMainMenu"),

    settingsModal: $("#settingsModal"),
    volMaster: $("#volMaster"),
    volMusic: $("#volMusic"),
    volSfx: $("#volSfx"),
    toggleTextSpeed: $("#toggleTextSpeed"),
    btnCloseSettings: $("#btnCloseSettings"),

    creditsModal: $("#creditsModal"),
    btnCloseCredits: $("#btnCloseCredits"),

    portraitLeft: $("#portraitLeft"),
    portraitRight: $("#portraitRight"),

    speakerName: $("#speakerName"),
    dialogueText: $("#dialogueText"),
    choices: $("#choices"),

    barRespect: $("#barRespect"),
    barTension: $("#barTension"),
    barSpark: $("#barSpark"),

    toast: $("#toast"),
  };

  // ---------- Audio ----------
  const musicPlayer = new Audio();
  musicPlayer.loop = true;
  musicPlayer.preload = "auto";

  const audioUrls = {
    music: GAME_DATA.assets.audio.music,
    sfx: GAME_DATA.assets.audio.sfx,
  };

  function getMusicUrl(key) {
    return audioUrls.music[key] || null;
  }
  function getSfxUrl(key) {
    return audioUrls.sfx[key] || null;
  }

  // ---------- FX Canvas (particles) ----------
  const fx = {
    ctx: dom.canvas.getContext("2d"),
    dpr: Math.max(1, window.devicePixelRatio || 1),
    particles: [],
    lastTs: performance.now(),
  };

  function resizeCanvas() {
    fx.dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.floor(window.innerWidth * fx.dpr);
    const h = Math.floor(window.innerHeight * fx.dpr);
    dom.canvas.width = w;
    dom.canvas.height = h;
  }

  function spriteFor(kind) {
    // Tiny pixel sprites: 0/1 matrices.
    // Each cell is drawn as a small square.
    if (kind === "heart") {
      return [
        "01100110",
        "11111111",
        "11111111",
        "01111110",
        "00111100",
        "00011000",
      ];
    }
    if (kind === "tear") {
      return [
        "001100",
        "011110",
        "011110",
        "011110",
        "001100",
        "001100",
      ];
    }
    // punch/explosion
    return [
      "0011100",
      "0111110",
      "1111111",
      "1111111",
      "0111110",
      "0011100",
    ];
  }

  function colorFor(kind) {
    if (kind === "heart") return "rgba(255,70,200,0.95)";
    if (kind === "tear") return "rgba(82,255,230,0.95)";
    return "rgba(255,213,106,0.95)"; // punch
  }

  function spawnParticles(kind, count = 18) {
    const w = dom.canvas.width;
    const h = dom.canvas.height;
    const cx = w * 0.62; // near dialogue box area
    const cy = h * 0.72;

    for (let i = 0; i < count; i++) {
      const a = (Math.random() * Math.PI * 2);
      const speed = (0.6 + Math.random() * 1.6) * fx.dpr * 140;
      fx.particles.push({
        kind,
        x: cx + (Math.random() * 80 - 40) * fx.dpr,
        y: cy + (Math.random() * 40 - 20) * fx.dpr,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - (120 * fx.dpr),
        life: 0,
        maxLife: 0.8 + Math.random() * 0.7,
        size: (kind === "punch" ? 4 : 3) * fx.dpr,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() * 2 - 1) * 4,
      });
    }
  }

  function tickFx(ts) {
    const dt = Math.min(0.033, (ts - fx.lastTs) / 1000);
    fx.lastTs = ts;

    const ctx = fx.ctx;
    const w = dom.canvas.width;
    const h = dom.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // subtle noise specks
    const specks = 40;
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let i = 0; i < specks; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillRect(x, y, 1 * fx.dpr, 1 * fx.dpr);
    }

    // particles
    for (let i = fx.particles.length - 1; i >= 0; i--) {
      const p = fx.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        fx.particles.splice(i, 1);
        continue;
      }
      // integrate
      p.vy += 360 * fx.dpr * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;

      const alpha = 1 - (p.life / p.maxLife);
      const sprite = spriteFor(p.kind);
      const color = colorFor(p.kind).replace(/[\d.]+\)$/, `${alpha.toFixed(3)})`); // hacky alpha replace

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = color;

      const cell = p.size;
      const rows = sprite.length;
      const cols = sprite[0].length;
      const ox = -(cols * cell) / 2;
      const oy = -(rows * cell) / 2;

      for (let y = 0; y < rows; y++) {
        const row = sprite[y];
        for (let x = 0; x < cols; x++) {
          if (row[x] === "1") {
            ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell);
          }
        }
      }
      ctx.restore();
    }

    requestAnimationFrame(tickFx);
  }

  // ---------- State ----------
  const defaultSettings = {
    master: 0.9,
    music: 0.7,
    sfx: 0.8,
    fastText: false,
  };

  const state = {
    nodeId: GAME_DATA.startNode,
    stats: { ...GAME_DATA.initialState.stats },
    settings: { ...defaultSettings },
    isPaused: false,
    isTyping: false,
    typingTimer: null,
    choiceTimer: null,
    currentMusicKey: null,
    lastChoiceCount: 0,
  };

  const STORAGE_KEY = "onlycans_chronicles_save_v1";
  const SETTINGS_KEY = "onlycans_chronicles_settings_v1";

  function saveGame() {
    const payload = {
      nodeId: state.nodeId,
      stats: state.stats,
      ts: Date.now(),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { }
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.nodeId || !parsed.stats) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function clearSave() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
  }

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); } catch { }
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed) return;
      state.settings.master = clamp(Number(parsed.master ?? defaultSettings.master), 0, 1);
      state.settings.music = clamp(Number(parsed.music ?? defaultSettings.music), 0, 1);
      state.settings.sfx = clamp(Number(parsed.sfx ?? defaultSettings.sfx), 0, 1);
      state.settings.fastText = Boolean(parsed.fastText ?? defaultSettings.fastText);
    } catch { }
  }

  function applyVolumes() {
    musicPlayer.volume = state.settings.master * state.settings.music;
    // SFX volume is applied per-play (so overlapping sounds are easy).
  }

  function playMusic(key) {
    if (state.currentMusicKey === key) return;
    const url = getMusicUrl(key);
    if (!url) return;

    state.currentMusicKey = key;

    // Fade-ish: lower volume momentarily during swap.
    const targetVol = state.settings.master * state.settings.music;
    const startVol = musicPlayer.volume;

    // If swapping, stop old, set new, play.
    musicPlayer.pause();
    musicPlayer.currentTime = 0;
    musicPlayer.src = url;
    musicPlayer.volume = Math.min(startVol, targetVol) * 0.7;
    safePlay(musicPlayer);

    // ramp up quickly
    const t0 = performance.now();
    const rampMs = 260;
    const tick = () => {
      const t = performance.now() - t0;
      const a = clamp(t / rampMs, 0, 1);
      musicPlayer.volume = (0.7 + 0.3 * a) * targetVol;
      if (a < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function playSfx(key) {
    const url = getSfxUrl(key);
    if (!url) return;
    const a = new Audio(url);
    a.preload = "auto";
    a.volume = state.settings.master * state.settings.sfx;
    safePlay(a);
  }

  // ---------- UI helpers ----------
  function toast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add("is-visible");
    setTimeout(() => dom.toast.classList.remove("is-visible"), 1400);
  }

  function setScreen(which) {
    dom.screenMenu.classList.toggle("is-active", which === "menu");
    dom.screenGame.classList.toggle("is-active", which === "game");
  }

  function showOverlay(el, show) {
    el.classList.toggle("is-hidden", !show);
  }

  function updateHud() {
    dom.barRespect.style.width = `${clamp(state.stats.respect, 0, 100)}%`;
    dom.barTension.style.width = `${clamp(state.stats.tension, 0, 100)}%`;
    dom.barSpark.style.width = `${clamp(state.stats.spark, 0, 100)}%`;
  }

  function setBackground(bgKey) {
    const url = GAME_DATA.assets.images[bgKey];
    if (!url) return;
    document.documentElement.style.setProperty("--bg-url", `url("${url}")`);
  }

  function setVideo(videoKey) {
    if (!dom.bgVideo) return; // Safety check if DOM missing

    // Error handler: if video fails, revert to static background
    dom.bgVideo.onerror = () => {
      console.warn("Video failed to load:", dom.bgVideo.src);
      dom.bgVideo.classList.add("is-hidden");
      document.documentElement.classList.remove("has-video");
    };

    if (!videoKey) {
      dom.bgVideo.classList.add("is-hidden");
      dom.bgVideo.pause();
      document.documentElement.classList.remove("has-video");
      return;
    }

    const url = GAME_DATA.assets.videos ? GAME_DATA.assets.videos[videoKey] : null;
    if (!url) {
      document.documentElement.classList.remove("has-video");
      return;
    }

    if (dom.bgVideo.src.includes(url) && !dom.bgVideo.paused && !dom.bgVideo.classList.contains("is-hidden")) {
      // already playing, ensure background is hidden
      document.documentElement.classList.add("has-video");
      return;
    }

    // Set video and hide static background
    dom.bgVideo.src = url;
    dom.bgVideo.classList.remove("is-hidden");
    document.documentElement.classList.add("has-video");

    safePlay(dom.bgVideo);
  }

  function setPortraits(portraits) {
    // portraits: {left:"JASON", right:"DAVID"} by character keys
    const leftId = portraits?.left ?? "JASON";
    const rightId = portraits?.right ?? "DAVID";

    const leftChar = GAME_DATA.characters[leftId] || GAME_DATA.characters.JASON;
    const rightChar = GAME_DATA.characters[rightId] || GAME_DATA.characters.DAVID;

    dom.portraitLeft.src = leftChar.portrait ? GAME_DATA.assets.images[leftChar.portrait] : "";
    dom.portraitRight.src = rightChar.portrait ? GAME_DATA.assets.images[rightChar.portrait] : "";

    dom.portraitLeft.alt = leftChar.name ? `${leftChar.name} portrait` : "";
    dom.portraitRight.alt = rightChar.name ? `${rightChar.name} portrait` : "";

    dom.portraitLeft.dataset.charId = leftId;
    dom.portraitRight.dataset.charId = rightId;
  }

  function highlightSpeaker(speakerId) {
    dom.portraitLeft.classList.remove("is-speaking");
    dom.portraitRight.classList.remove("is-speaking");

    const leftId = dom.portraitLeft.dataset.charId;
    const rightId = dom.portraitRight.dataset.charId;

    if (speakerId === leftId) {
      dom.portraitLeft.classList.add("is-speaking");
    } else if (speakerId === rightId) {
      dom.portraitRight.classList.add("is-speaking");
    }
  }

  // ---------- Effects ----------
  function applyEffect(effect) {
    if (!effect) return;
    switch (effect.type) {
      case "stat": {
        const key = effect.name;
        const delta = Number(effect.delta ?? 0);
        if (typeof state.stats[key] !== "number") return;
        state.stats[key] = clamp(state.stats[key] + delta, 0, 100);
        updateHud();
        break;
      }
      case "sfx": {
        playSfx(effect.name);
        break;
      }
      case "particles": {
        const kind = effect.kind || "punch";
        const count = Number(effect.count ?? 18);
        spawnParticles(kind, count);
        break;
      }
      case "toast": {
        toast(effect.message || "");
        break;
      }
      default:
        // unknown effects are ignored (for forward compatibility)
        break;
    }
  }

  function applyEffects(effects) {
    if (!effects || !Array.isArray(effects)) return;
    for (const e of effects) applyEffect(e);
  }

  // ---------- Requirements ----------
  function requirementsMet(req) {
    if (!req) return true;
    const v1 = state.stats[req.stat];
    if (typeof v1 === "number") {
      if (req.gte != null && v1 < req.gte) return false;
      if (req.lte != null && v1 > req.lte) return false;
    }
    if (req.stat2) {
      const v2 = state.stats[req.stat2];
      if (typeof v2 === "number") {
        if (req.gte2 != null && v2 < req.gte2) return false;
        if (req.lte2 != null && v2 > req.lte2) return false;
      }
    }
    return true;
  }

  function requirementsLabel(req) {
    if (!req) return "";
    const parts = [];
    if (req.stat && req.gte != null) parts.push(`${req.stat} ≥ ${req.gte}`);
    if (req.stat && req.lte != null) parts.push(`${req.stat} ≤ ${req.lte}`);
    if (req.stat2 && req.gte2 != null) parts.push(`${req.stat2} ≥ ${req.gte2}`);
    if (req.stat2 && req.lte2 != null) parts.push(`${req.stat2} ≤ ${req.lte2}`);
    return parts.join(" • ");
  }

  // ---------- Dialogue / Typewriter ----------
  function clearTyping() {
    state.isTyping = false;
    if (state.typingTimer) {
      clearInterval(state.typingTimer);
      state.typingTimer = null;
    }
  }

  function clearChoiceTimer() {
    if (state.choiceTimer) {
      clearTimeout(state.choiceTimer);
      state.choiceTimer = null;
    }
  }

  const CHOICE_DELAY_MS = 3000;

  function typeText(mdText, onDone) {
    clearTyping();
    state.isTyping = true;

    const plain = stripMarkdown(mdText);
    dom.dialogueText.textContent = "";
    // Slow the base typewriter speed by 50% (half speed).
    const baseSpeed = state.settings.fastText ? 6 : 18; // ms per char (original)
    const speed = baseSpeed * 2;
    let i = 0;

    state.typingTimer = setInterval(() => {
      if (state.isPaused) {
        clearTyping();
        dom.dialogueText.innerHTML = renderMarkdown(mdText);
        if (onDone) onDone();
        return;
      }
      i++;
      dom.dialogueText.textContent = plain.slice(0, i);
      if (i >= plain.length) {
        clearTyping();
        dom.dialogueText.innerHTML = renderMarkdown(mdText);
        if (onDone) onDone();
      }
    }, speed);
  }

  function finishTypingImmediately(mdText) {
    clearTyping();
    dom.dialogueText.innerHTML = renderMarkdown(mdText);
  }

  function scheduleChoices(node) {
    clearChoiceTimer();

    // End nodes use their own end options immediately.
    if (node.end) {
      return;
    }

    // Small "thinking" indicator while we wait.
    dom.choices.innerHTML = "<div class=\"choices-wait muted\">…</div>";

    const scheduledForNodeId = state.nodeId;
    state.choiceTimer = setTimeout(() => {
      // If we moved nodes since scheduling (fast clicks / skips), ignore.
      if (state.nodeId !== scheduledForNodeId) return;
      renderChoices(node);
    }, CHOICE_DELAY_MS);
  }

  // ---------- Node rendering ----------
  function renderChoices(node) {
    dom.choices.innerHTML = "";
    const choices = node.choices || [];
    state.lastChoiceCount = choices.length;

    if (choices.length === 0) {
      // End nodes will populate their own options.
      return;
    }

    let idx = 0;
    for (const ch of choices) {
      idx++;

      const btn = document.createElement("button");
      btn.className = "choice";
      btn.type = "button";

      const ok = requirementsMet(ch.requires);
      if (!ok) {
        btn.classList.add("is-locked");
        btn.disabled = true;
      }

      const main = document.createElement("div");
      main.textContent = `${idx}. ${ch.text}`;
      btn.appendChild(main);

      if (ch.requires && !ok) {
        const meta = document.createElement("span");
        meta.className = "meta";
        meta.textContent = `Locked: ${requirementsLabel(ch.requires)}`;
        btn.appendChild(meta);
      }

      btn.addEventListener("click", () => {
        if (state.isPaused) return;
        if (state.isTyping) {
          // First click finishes the line (nice UX).
          finishTypingImmediately(node.text);
          return;
        }
        if (btn.disabled) return;

        playSfx("click");
        applyEffects(ch.effects);
        if (ch.next) {
          gotoNode(ch.next);
        }
      });

      dom.choices.appendChild(btn);
    }
  }

  function renderEndOptions() {
    dom.choices.innerHTML = "";

    const btnRestart = document.createElement("button");
    btnRestart.className = "choice";
    btnRestart.textContent = "1. Restart from the beginning";
    btnRestart.addEventListener("click", () => {
      playSfx("click");
      startNewGame();
    });

    const btnMenu = document.createElement("button");
    btnMenu.className = "choice";
    btnMenu.textContent = "2. Return to Main Menu";
    btnMenu.addEventListener("click", () => {
      playSfx("click");
      backToMenu();
    });

    dom.choices.appendChild(btnRestart);
    dom.choices.appendChild(btnMenu);
  }

  function gotoNode(id) {
    try {
      const node = GAME_DATA.nodes[id];
      if (!node) {
        toast(`Missing node: ${id}`);
        return;
      }

      state.nodeId = id;
      saveGame();

      clearTyping();
      clearChoiceTimer();
      dom.choices.innerHTML = "";

      // Scene
      if (node.scene?.bg) setBackground(node.scene.bg);

      // Video (overrides/overlays background)
      if (node.scene?.video) {
        setVideo(node.scene.video);
      } else {
        setVideo(null); // stop video if not specified
      }

      if (node.scene?.music) playMusic(node.scene.music);

      // Portraits (if overridden)
      if (node.portraits) setPortraits(node.portraits);

      // Speaker
      const speakerId = node.speaker || "NARRATOR";
      const speaker = GAME_DATA.characters[speakerId] || GAME_DATA.characters.NARRATOR;
      dom.speakerName.textContent = speaker.name;

      highlightSpeaker(speakerId);

      // Node enter effects
      applyEffects(node.onEnter);

      // Text
      typeText(node.text || "", () => {
        if (node.end) {
          // Present ending title & text
          dom.speakerName.textContent = `THE END — ${node.end.title}`;
          dom.dialogueText.innerHTML = renderMarkdown(node.end.text || "");
          renderEndOptions();
          clearSave(); // end screens don't resume
          return;
        }
        scheduleChoices(node);
      });
    } catch (err) {
      console.error("gotoNode failed:", err);
      toast("Error: " + err.message);
    }
  }

  // ---------- Game flow ----------
  function startNewGame() {
    state.stats = { ...GAME_DATA.initialState.stats };
    updateHud();
    setPortraits({ left: "JASON", right: "DAVID" });
    setScreen("game");
    showOverlay(dom.pauseOverlay, false);
    showOverlay(dom.settingsModal, false);
    showOverlay(dom.creditsModal, false);
    state.isPaused = false;
    gotoNode(GAME_DATA.startNode);
  }

  function continueGame() {
    const save = loadSave();
    if (!save) {
      startNewGame();
      return;
    }
    state.stats = { ...GAME_DATA.initialState.stats, ...save.stats };
    updateHud();
    setPortraits({ left: "JASON", right: "DAVID" });
    setScreen("game");
    showOverlay(dom.pauseOverlay, false);
    state.isPaused = false;
    gotoNode(save.nodeId);
    toast("Continued saved run");
  }

  function backToMenu() {
    clearTyping();
    setScreen("menu");
    showOverlay(dom.pauseOverlay, false);
    showOverlay(dom.settingsModal, false);
    showOverlay(dom.creditsModal, false);
    state.isPaused = false;
    playMusic("menu");
  }

  function togglePause(force) {
    if (!dom.screenGame.classList.contains("is-active")) return;

    const next = (force != null) ? Boolean(force) : !state.isPaused;
    state.isPaused = next;

    showOverlay(dom.pauseOverlay, state.isPaused);
    if (state.isPaused) {
      toast("Paused");
    } else {
      toast("Resumed");
    }
  }

  // ---------- Settings UI ----------
  function syncSettingsUI() {
    dom.volMaster.value = state.settings.master;
    dom.volMusic.value = state.settings.music;
    dom.volSfx.value = state.settings.sfx;
    dom.toggleTextSpeed.checked = state.settings.fastText;
  }

  function openSettings() {
    syncSettingsUI();
    showOverlay(dom.settingsModal, true);
  }

  function closeSettings() {
    showOverlay(dom.settingsModal, false);
    saveSettings();
  }

  // ---------- Input ----------
  function onKeyDown(e) {
    // Ignore if typing in a form element
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea") return;

    if (e.key === "Escape") {
      if (!dom.pauseOverlay.classList.contains("is-hidden")) {
        togglePause(false);
        return;
      }
      if (dom.settingsModal && !dom.settingsModal.classList.contains("is-hidden")) {
        closeSettings();
        return;
      }
      if (dom.creditsModal && !dom.creditsModal.classList.contains("is-hidden")) {
        showOverlay(dom.creditsModal, false);
        return;
      }
      if (dom.screenGame.classList.contains("is-active")) {
        togglePause();
      }
      return;
    }

    if (dom.screenMenu.classList.contains("is-active")) {
      if (e.key === "Enter") {
        // Continue if save exists, else start new
        const save = loadSave();
        if (save) continueGame();
        else startNewGame();
      }
      return;
    }

    // In-game shortcuts
    if (dom.screenGame.classList.contains("is-active")) {
      if (e.key.toLowerCase() === "p") {
        togglePause();
        return;
      }
      if (state.isPaused) return;

      if (e.key === " " || e.key === "Enter") {
        // If typing, finish. Otherwise click first available choice.
        const node = GAME_DATA.nodes[state.nodeId];
        if (state.isTyping) {
          finishTypingImmediately(node.text || "");
          scheduleChoices(node);
          return;
        }
        // Click first non-disabled choice if present.
        const buttons = [...dom.choices.querySelectorAll("button.choice")];
        const first = buttons.find(b => !b.disabled);
        if (first) first.click();
        return;
      }

      // 1-4 picks choices
      if (/^[1-4]$/.test(e.key)) {
        const n = Number(e.key);
        const btn = dom.choices.querySelector(`button.choice:nth-child(${n})`);
        if (btn && !btn.disabled) btn.click();
        return;
      }
    }
  }

  // ---------- Wiring ----------
  function bindUI() {
    dom.btnStart.addEventListener("click", () => {
      const save = loadSave();
      if (save) continueGame();
      else startNewGame();
    });

    dom.btnSettings.addEventListener("click", () => {
      playSfx("click");
      openSettings();
    });

    dom.btnCredits.addEventListener("click", () => {
      playSfx("click");
      showOverlay(dom.creditsModal, true);
    });

    dom.btnCloseCredits.addEventListener("click", () => {
      playSfx("click");
      showOverlay(dom.creditsModal, false);
    });

    dom.btnCloseSettings.addEventListener("click", () => {
      playSfx("click");
      closeSettings();
    });

    dom.btnPause.addEventListener("click", () => togglePause(true));
    dom.btnResume.addEventListener("click", () => togglePause(false));
    dom.btnMainMenu.addEventListener("click", () => backToMenu());
    dom.btnPauseSettings.addEventListener("click", () => openSettings());

    dom.volMaster.addEventListener("input", () => {
      state.settings.master = clamp(Number(dom.volMaster.value), 0, 1);
      applyVolumes();
    });
    dom.volMusic.addEventListener("input", () => {
      state.settings.music = clamp(Number(dom.volMusic.value), 0, 1);
      applyVolumes();
    });
    dom.volSfx.addEventListener("input", () => {
      state.settings.sfx = clamp(Number(dom.volSfx.value), 0, 1);
      applyVolumes();
    });
    dom.toggleTextSpeed.addEventListener("change", () => {
      state.settings.fastText = Boolean(dom.toggleTextSpeed.checked);
      saveSettings();
    });

    // Click dialogue to finish typing (or do nothing if already finished).
    dom.dialogueText.addEventListener("click", () => {
      if (!dom.screenGame.classList.contains("is-active")) return;
      const node = GAME_DATA.nodes[state.nodeId];
      if (state.isTyping) {
        finishTypingImmediately(node.text || "");
        scheduleChoices(node);
      }
    });

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", resizeCanvas);
  }

  function boot() {
    loadSettings();
    syncSettingsUI();
    applyVolumes();

    resizeCanvas();
    requestAnimationFrame(tickFx);

    // Initialize screen visuals
    setBackground("bg_dojo");
    setPortraits({ left: "JASON", right: "DAVID" });
    updateHud();

    bindUI();

    // Menu music (won't autoplay until interaction; that's fine)
    playMusic("menu");

    // Helpful hint if a save exists
    if (loadSave()) {
      toast("Press Start/Enter to Continue");
    } else {
      toast("Press Start/Enter");
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
