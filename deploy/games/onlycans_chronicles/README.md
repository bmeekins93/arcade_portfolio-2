# OnlyCans Chronicles — Web Prototype

This is a **dialogue-driven** web game prototype (HTML/CSS/JS) with:

- Main Menu + Credits
- Pause Menu (Esc/P)
- Settings (Master / Music / SFX volumes + fast text)
- Background scene images that change during the story
- Character portraits (Jason / David / Priscilla)
- Menu music + in‑game mood music (placeholder MP3 loops)
- SFX (placeholder MP3s) + 8‑bit particle FX (hearts / punches / tears) via `<canvas>`

## Run it

### Option A: just open the file
Open `index.html` in your browser.

> Note: Some browsers block autoplay audio until you click once. That’s expected.

### Option B: run a local server (recommended)
From this folder:

```bash
python3 -m http.server 8080
```

Then open: http://localhost:8080

## Replace art / audio

All assets live in:

- `assets/images/` (PNG)
- `assets/audio/` (MP3)

Swap files **keeping the same filenames** and the game will pick them up automatically.

## Edit the story

Open `js/story.js`. The narrative is a simple node graph:

```js
nodes: {
  myNodeId: {
    scene: { bg: "bg_dojo", music: "dojo" },
    speaker: "DAVID",
    text: "Hello.",
    choices: [
      { text: "Reply", next: "anotherNode", effects: [ ... ] }
    ]
  }
}
```

Effects supported:

- `{type:"stat", name:"respect"|"tension"|"spark", delta:+/-Number}`
- `{type:"sfx", name:"punch"|"kiss"|...}`
- `{type:"particles", kind:"heart"|"punch"|"tear", count:Number}`

You can lock a choice behind stats:

```js
{ text:"Secret option", next:"...", requires:{ stat:"spark", gte:20 } }
```

---

Have fun, and please don’t feed the dojo after midnight.
