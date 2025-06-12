FROM node:22

WORKDIR /app

COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install && npm run build

# Install serve to serve the Next.js frontend
RUN npm install -g serve

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 8000
EXPOSE 8050

ENV NODE_ENV=production
CMD ["/app/start.sh"]
