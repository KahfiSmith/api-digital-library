# Use official Node.js runtime as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies with limited memory
RUN NODE_OPTIONS="--max-old-space-size=512" pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build stage
FROM base AS builder

# Generate Prisma client with limited memory
RUN NODE_OPTIONS="--max-old-space-size=512" pnpm exec prisma generate

# Build the application with limited memory
RUN NODE_OPTIONS="--max-old-space-size=512" pnpm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only with reduced memory usage
RUN NODE_OPTIONS="--max-old-space-size=512" pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create logs and uploads directories
RUN mkdir -p logs public/uploads/avatars public/uploads/covers public/uploads/temp

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/server.js"]
