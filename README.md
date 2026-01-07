# Arcade Portfolio (v2)

A Phaser 3-powered interactive arcade lobby that launches projects via external links or embedded iframes.

## Project Structure

*   `/index.html`: Main entry point (Phaser lobby + CRT modal).
*   `/assets`: Game assets (cabinet PNGs, background, audio).
*   `/games`: Submodules/folders for embedded games.
    *   `onlycans_supermarket_bash/`: Vite project. Build output lives in `dist/`.
    *   `onlycans_chronicles/`: Static HTML/JS.
    *   `jayF-durdayup/`: Static HTML/JS.
    *   `pro2mussy-main/`: Static HTML/JS.

## Run Locally

Because Phaser loads assets dynamically, you must use a local server.

### Python (Simple)
From this folder:
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000).

## Building Embedded Games

Most games are static, but **OnlyCans: Supermarket Bash** is a Vite project that requires building if you modify it.

To rebuild Supermarket Bash:
1.  Navigate to the folder:
    ```bash
    cd games/onlycans_supermarket_bash
    ```
2.  Install dependencies (if not done):
    ```bash
    npm install
    ```
3.  Build:
    ```bash
    npm run build
    ```
    *This will generate the `dist/` folder that the portfolio embeds.*

## Deployment

This project is ready for static hosting (GitHub Pages, Netlify, Vercel).

## Deployment

This project includes a build script to create a clean, host-ready version of the portfolio, stripping out large development files like `node_modules`.

### How to Build
Run the build script from the project root:
```bash
./scripts/build_deploy.sh
```
This will create a `./deploy` folder.

### How to Host
Simply upload the contents of the `./deploy` folder to any static host (Netlify, Vercel, GitHub Pages, or S3).
- **Entry Point:** `index.html`
- **Requirements:** None (Static HTML/JS)

### How to Test Deployment Locally
```bash
cd deploy
python3 -m http.server 8000
```

## Maintenance Notes
- **Unused Assets:** Files like `floor_*.png` that are not currently used in the game are stored in `assets/unused/`. They are excluded from the deployment build.
- **Audio:** The main theme is located at `assets/pats_theme.mp3`.

**Deploy these files/folders:**
*   `index.html`
*   `assets/`
*   `games/` (ensure `dist` folders are included)

**Ignored files (do not deploy):**
*   `node_modules/`
*   `.git/`
*   `.DS_Store`
*   `assets/unused/`

## Controls
*   **Move**: WASD or Arrow Keys
*   **Interact**: E or Space (when near a cabinet)
*   **Launch**: Enter (when modal is open)
*   **Close**: Esc
*   **Toggle Sound**: M
