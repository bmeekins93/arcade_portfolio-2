# Arcade Portfolio (v2)

This zip includes:
- `index.html` (Phaser arcade lobby + CRT modal)
- `/assets` (the 4 transparent PNGs)

## Run locally (recommended)
Because Phaser loads image files, run a local server (instead of double-clicking `index.html`):

### Python
From this folder:
- `python -m http.server 8000`
Then open:
- http://localhost:8000

## Controls
- Move: **WASD** or **Arrow keys**
- Interact (when near a cabinet): **E** or **Space**
- Launch project (when modal is open): **Enter**
- Close modal: **Esc** or click outside the modal
- Toggle beep sounds: **M**

## Add your real project links
Open `index.html` and update the `PROJECTS` object near the top:
- `url: "https://..."`

When a URL is present, the modal's **Launch** button becomes clickable.
