#!/bin/bash
# scripts/build_deploy.sh

# 1) Set up paths
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$PROJECT_ROOT/deploy"

echo "========================================"
echo "    ARCADE PORTFOLIO DEPTH CHARGE"
echo "========================================"
echo "Project Root: $PROJECT_ROOT"
echo "Deploy Dir:   $DEPLOY_DIR"
echo "----------------------------------------"

# 2) Clean previous deploy
if [ -d "$DEPLOY_DIR" ]; then
  echo "[1/4] Cleaning previous deploy artifact..."
  rm -rf "$DEPLOY_DIR"
fi
mkdir -p "$DEPLOY_DIR"

# 3) Copy Core Files (index.html, README for the deploy)
echo "[2/4] Copying core files..."
cp "$PROJECT_ROOT/index.html" "$DEPLOY_DIR/"

# 4) Copy Assets (Excluding unused)
echo "[3/4] Copying assets (skipping unused)..."
rsync -av --progress "$PROJECT_ROOT/assets/" "$DEPLOY_DIR/assets/" \
  --exclude "unused" \
  --exclude ".DS_Store" \
  --exclude "__MACOSX"

# 5) Copy Games (Excluding dev junk)
echo "[4/4] Copying games (filtering dev junk)..."
rsync -av --progress "$PROJECT_ROOT/games/" "$DEPLOY_DIR/games/" \
  --exclude "node_modules" \
  --exclude ".git" \
  --exclude ".DS_Store" \
  --exclude "__MACOSX" \
  --exclude "package-lock.json" \
  --exclude "yarn.lock" \
  --exclude ".env*" \
  --exclude "tsconfig.json" \
  --exclude "vite.config.ts" \
  --exclude "package.json"

echo "----------------------------------------"
echo "✅ DEPLOY ARTIFACT CREATED SUCCESSFULLY"
echo "   Location: $DEPLOY_DIR"
echo "----------------------------------------"
echo "To test locally:"
echo "   cd $DEPLOY_DIR"
echo "   python3 -m http.server 8000"
echo "========================================"
