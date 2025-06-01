# syntax=docker/dockerfile:1

# --- Stage 1: Install dependencies ---
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy environment variables
COPY .env ./

# Copy all source code
COPY . .

# Remove development dependencies for smaller image
RUN npm prune --omit=dev

# --- Stage 2: Create the production image ---
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy everything except devDependencies from builder
COPY --from=builder /app ./

# Set environment variable
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
