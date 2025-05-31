# syntax=docker/dockerfile:1

# --- Stage 1: Build the Vite App ---
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files and install exact versions (faster, safer in CI)
COPY package*.json ./
RUN npm ci

# Copy all source files (including .env files for Vite)
COPY . .

# Build the Vite app (Vite will automatically pick up .env, .env.production, etc.)
RUN npm run build

# --- Stage 2: Serve the built files using `serve` ---
FROM node:18-alpine AS runner

# Install `serve` globally to serve the static files
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy only the built output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port on which `serve` will serve files (default is 3000, but you're using 5173)
EXPOSE 5173

# Serve the static files from the dist folder on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
