#!/bin/sh
set -e

echo "Running database migrations..."
npx drizzle-kit push --yes

echo "Starting server..."
exec node build/index.js
