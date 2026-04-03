#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║         JEOPARDY DEPLOYMENT          ║"
echo "╚══════════════════════════════════════╝"
echo ""

echo "┌──────────────────────────────────────┐"
echo "│  🔄  Pulling latest from GitHub...   │"
echo "└──────────────────────────────────────┘"
git pull origin main

echo ""
echo "┌──────────────────────────────────────┐"
echo "│  📦  Installing dependencies...      │"
echo "└──────────────────────────────────────┘"
npm install

echo ""
echo "┌──────────────────────────────────────┐"
echo "│  🔨  Building...                     │"
echo "└──────────────────────────────────────┘"
npm run build

echo ""
echo "┌──────────────────────────────────────┐"
echo "│  🗄️   Pushing database schema...     │"
echo "└──────────────────────────────────────┘"
npm run db:push

echo ""
echo "┌──────────────────────────────────────┐"
echo "│  🔁  Restarting PM2...               │"
echo "└──────────────────────────────────────┘"
pm2 restart jeopardy

echo ""
echo "╔══════════════════════════════════════╗"
echo "║       ✅  DEPLOYMENT COMPLETE!       ║"
echo "╚══════════════════════════════════════╝"
echo ""
pm2 logs jeopardy --lines 10 --nostream