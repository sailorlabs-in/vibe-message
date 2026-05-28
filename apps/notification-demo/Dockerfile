# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root package files including nx configuration
COPY package*.json ./
# Copy workspace libs
COPY libs ./libs
# Copy demo app
COPY apps/notification-demo ./apps/notification-demo

# Install workspace dependencies
RUN npm install

# Build SDK first since apps depend on its output
RUN npm run build -w vibe-message

# Build Next.js application
RUN npx nx run notification-demo:build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/notification-demo/package*.json ./apps/notification-demo/
COPY libs ./libs

# Copy built SDK from builder stage
COPY --from=builder /app/libs/sdk/dist ./libs/sdk/dist

# Install ALL dependencies (including devDependencies for TypeScript support in NextJS)
RUN npm install

# Copy built application from builder
COPY --from=builder /app/apps/notification-demo/.next ./apps/notification-demo/.next
COPY --from=builder /app/apps/notification-demo/public ./apps/notification-demo/public
COPY --from=builder /app/apps/notification-demo/next.config.ts ./apps/notification-demo/next.config.ts

# Expose port
EXPOSE 3000

# Start the application
WORKDIR /app/apps/notification-demo
CMD ["npm", "start"]
