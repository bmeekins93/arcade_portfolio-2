#!/bin/bash
echo "Attemping to launch Arcade Portfolio..."

PORT=3000

# Try Python 3
if command -v python3 &> /dev/null; then
    echo "Found Python 3. Starting server on port $PORT..."
    python3 -m http.server $PORT
    exit
fi

# Try Python 2
if command -v python &> /dev/null; then
    echo "Found Python. Starting server on port $PORT..."
    python -m SimpleHTTPServer $PORT
    exit
fi

# Try PHP
if command -v php &> /dev/null; then
    echo "Found PHP. Starting server on port $PORT..."
    php -S localhost:$PORT
    exit
fi

# Try npm/npx
if command -v npx &> /dev/null; then
    echo "Found Node. Starting server on port $PORT..."
    npx -y http-server -p $PORT
    exit
fi

echo "No suitable server found (Python, PHP, or Node). Please install one."
