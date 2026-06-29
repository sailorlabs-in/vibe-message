# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root package files including nx configuration
COPY package*.json ./
# Copy workspace libs
COPY libs ./libs
# Copy frontend app
COPY apps/frontend ./apps/frontend
# Copy frontend .env files to root of builder context so loadEnv(mode, process.cwd()) can load it
COPY apps/frontend/.env* ./

# Install workspace dependencies
RUN npm install

# Build SDK first since apps depend on its output
RUN npm run build -w vibe-message

# Build the frontend application
RUN npx nx run vibe-message-frontend:build

# Production stage
FROM nginx:alpine

# Copy built assets from builder output in dist/apps/frontend
# Note: Nx build output path for vite usually dist/apps/frontend
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy service worker to root
COPY --from=builder /app/apps/frontend/public/push-sw.js /usr/share/nginx/html/

# Create nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    include /etc/nginx/mime.types; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /push-sw.js { \
        default_type application/javascript; \
        add_header Service-Worker-Allowed /; \
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
