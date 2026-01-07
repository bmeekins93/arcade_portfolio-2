#!/bin/bash

# Configuration
DEPLOY_DIR="deploy"

# 1. Clean previous deploy
echo "Cleaning $DEPLOY_DIR..."
rm -rf "$DEPLOY_DIR"
mkdir "$DEPLOY_DIR"

# 2. Copy Main Arcade source
echo "Copying Arcade Lobby..."
cp index.html "$DEPLOY_DIR/"
cp -r assets "$DEPLOY_DIR/"
cp index.css "$DEPLOY_DIR/" 2>/dev/null || echo "No global index.css found (OK)"

# 3. Handle Embedded Games
echo "Processing Games..."
mkdir -p "$DEPLOY_DIR/games"

# -- OnlyCans Chronicles (assuming simple HTML/JS)
if [ -d "games/onlycans_chronicles" ]; then
    echo "  Copying OnlyCans Chronicles..."
    cp -r "games/onlycans_chronicles" "$DEPLOY_DIR/games/"
fi

# -- OnlyCans Supermarket Bash (Vite Project -> needs dist)
if [ -d "games/onlycans_supermarket_bash/dist" ]; then
    echo "  Copying OnlyCans Supermarket Bash (dist)..."
    mkdir -p "$DEPLOY_DIR/games/onlycans_supermarket_bash"
    cp -r "games/onlycans_supermarket_bash/dist/"* "$DEPLOY_DIR/games/onlycans_supermarket_bash/"
else
    echo "WARNING: OnlyCans Supermarket Bash dist/ not found. Run 'npm run build' in that folder first."
fi

# -- Jay-F Remix (Vite Project -> needs dist)
# Note: Based on previous context, this might be in games/jayF-durdayup or similar. 
# Checking logic: copy if dist exists.
if [ -d "games/jayF-durdayup/dist" ]; then
    echo "  Copying Jay-F Remix (dist)..."
    mkdir -p "$DEPLOY_DIR/games/jayF-durdayup"
    cp -r "games/jayF-durdayup/dist/"* "$DEPLOY_DIR/games/jayF-durdayup/"
elif [ -d "games/jayF-durdayup" ]; then
     echo "WARNING: Jay-F Remix dist/ not found. Is it built?"
fi

# -- pro2mussy (assuming simple structure or dist)
if [ -d "games/pro2mussy-main" ]; then
    echo "  Copying pro2mussy..."
    cp -r "games/pro2mussy-main" "$DEPLOY_DIR/games/"
fi

# 4. Final Cleanup
echo "Removing dev junk from deploy..."
find "$DEPLOY_DIR" -name ".DS_Store" -delete
find "$DEPLOY_DIR" -name "node_modules" -prune -exec rm -rf {} +

echo "-----------------------------------"
echo "Build complete! Content is in: $DEPLOY_DIR"
echo "To test: python3 -m http.server 8000 -d $DEPLOY_DIR"
