# Use official Node.js base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy backend and frontend code
COPY backend ./backend
COPY frontend ./frontend

# Install frontend dependencies and build Next.js app
WORKDIR /app/frontend
RUN npm install && npm run build

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install serve for frontend static file serving
RUN npm install -g serve

# Copy startup script
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Set environment variables
ENV NODE_ENV=production

# Expose ports:
# - 3000 for frontend
# - 8050 (or any APP_PORT) for backend
EXPOSE 3000
EXPOSE 8050

# Start the application
CMD ["/app/start.sh"]
