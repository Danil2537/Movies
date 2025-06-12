#!/bin/sh

# Start backend
node /app/backend/server.js &

# Start frontend (Next.js production build)
serve -s /app/frontend/.next -l 8000