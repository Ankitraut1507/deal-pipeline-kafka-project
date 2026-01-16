# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code and nginx config
COPY . .

# Build the Angular application for production
RUN npm run build -- --configuration production

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration from build stage
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular application
COPY --from=build /app/dist/deal-pipeline-ui/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
