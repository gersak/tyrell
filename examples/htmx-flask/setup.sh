#!/bin/bash
# One-time setup: Node tools for Tailwind + the icon bundle, Python deps in a venv.
set -e
cd "$(dirname "$0")"

npm install
npm run build            # static/css/app.css + static/js/icons.js

python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

echo ""
echo "Ready. Run:  .venv/bin/python app.py   →  http://localhost:9000"
