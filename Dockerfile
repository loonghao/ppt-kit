# PPT-KIT Docker Image
# Multi-stage build for production deployment

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy manifest files
COPY --from=builder /app/manifest /usr/share/nginx/html/manifest

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: MCP Server (optional)
FROM node:20-alpine AS mcp-server

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy MCP server files
COPY --from=builder /app/dist/mcp ./dist/mcp
COPY --from=builder /app/src/mcp ./src/mcp

# Install tsx for running TypeScript
RUN npm install -g tsx

# Expose MCP server port
EXPOSE 3100

# Environment variables
ENV TRANSPORT=http
ENV PORT=3100

# Start MCP server
CMD ["tsx", "src/mcp/server/standalone.ts"]
