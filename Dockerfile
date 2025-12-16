# Multi-stage build for React app
FROM node:18-alpine AS frontend-build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Node.js backend stage
FROM node:18-alpine AS backend
WORKDIR /app/backend

# Copy backend files
COPY catan-server/package*.json ./
RUN npm install

COPY catan-server/ ./

# Final stage with Nginx
FROM nginx:alpine
WORKDIR /app

# Install Node.js for backend
RUN apk add --no-cache nodejs npm supervisor

# Copy built React app
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy backend
COPY --from=backend /app/backend /app/backend

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create supervisor config
RUN echo $'[supervisord]\n\
nodaemon=true\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n\
\n\
[program:backend]\n\
command=node /app/backend/index.js\n\
directory=/app/backend\n\
autostart=true\n\
autorestart=true\n\
environment=NODE_ENV=production,PORT=3002' > /etc/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]