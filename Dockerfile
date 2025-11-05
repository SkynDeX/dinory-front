# Multi-stage build for React application

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Stage 2: Runtime with Nginx
FROM nginx:1.25-alpine

# Copy custom nginx template (envsubst will render at runtime)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built React app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
