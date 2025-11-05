# Production-ready Dockerfile for NestJS backend

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy only built files and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy any necessary assets (if needed, add COPY for public/static folders here)

# Expose the port (default 3004, can be overridden by PORT env)
EXPOSE 5501

# Use environment variables at runtime (do NOT bake .env into image)
CMD ["node", "dist/main"]
