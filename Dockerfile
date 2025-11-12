# Multi-stage build for React application

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack(Yarn) and copy manifests
RUN corepack enable

COPY package.json yarn.lock ./

# Install dependencies (Yarn)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build React app
RUN yarn build

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
