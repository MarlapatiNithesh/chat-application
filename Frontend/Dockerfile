# syntax=docker/dockerfile:1

# --- Stage 1: Build the Vite App ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (exact versions)
RUN npm ci

# Copy all source files including environment files
COPY . .

# Build the app (outputs to /app/dist)
RUN npm run build

# --- Stage 2: Serve the built app with `vite preview` ---
FROM node:18-alpine AS runner

WORKDIR /app

# Copy production dependencies and built output
COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist

# Expose Vite preview server port (default 4173)
EXPOSE 4173

# Run vite preview to serve the static files on port 4173
CMD ["npm", "run", "preview"]
