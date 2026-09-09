# Multi-stage Production Dockerfile for CodeMentorAI

# Stage 1: Build Frontend React SPA
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Backend Server
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy Backend Dependencies & Source
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

COPY backend/ ./backend/

# Copy Frontend Built Assets to Backend Static / Production Dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

USER node

CMD ["node", "backend/index.js"]
