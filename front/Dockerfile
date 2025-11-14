# Multi-stage Dockerfile (static SPA served with Nginx)
# Builder: install dependencies and build only the client (Vite)
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Use corepack to get pnpm
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

# Copy package files and install dependencies (cached layer)
COPY package.json pnpm-lock.yaml ./

# Copy source and build client only
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm build:client

# Runtime: serve the built SPA with nginx
FROM nginx:stable-alpine AS runner

# Remove default nginx content and copy built SPA
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Copy custom nginx config to enable HTML5 history fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
