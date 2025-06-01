# syntax=docker/dockerfile:1

# --- Stage 1: Install dependencies ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Remove dev dependencies for smaller image
RUN npm prune --omit=dev

# --- Stage 2: Create the production image ---
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
