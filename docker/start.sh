#!/bin/sh

# Use $APP_PORT or default to 8050
APP_PORT=${APP_PORT:-8050}

echo "Starting backend on port $APP_PORT..."
PORT=$APP_PORT node /app/backend/server.js &

# Check if FRONTEND env var is set to true
if [ "$FRONTEND" = "true" ]; then
  echo "Starting frontend on port 3000..."
  cd /app/frontend
  npm run start
else
  echo "Frontend not included. Only backend is running."
  wait
fi