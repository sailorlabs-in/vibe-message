# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root package files including nx configuration
COPY package*.json ./
# Copy workspace libs
COPY libs ./libs
# Copy server app
COPY apps/server ./apps/server

# Install workspace dependencies
RUN npm install

# Build SDK first since apps depend on its output
RUN npm run build -w vibe-message

# Build TypeScript
RUN npx nx run vibe-message-server:build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY libs ./libs

# Copy built SDK from builder stage
COPY --from=builder /app/libs/sdk/dist ./libs/sdk/dist

# Install production dependencies only via workspace
RUN npm install --omit=dev

# Copy built application from builder
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Expose port
EXPOSE 5000

# Start the application using workspace command
WORKDIR /app/apps/server
CMD ["node", "dist/main.js"]
