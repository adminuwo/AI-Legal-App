<<<<<<< HEAD
# =========================================================================
# Production Server (Node.js Express Backend & Static Host)
# =========================================================================
FROM node:20-alpine

WORKDIR /app

# Install native dependencies required by canvas, pdf-parse, sharp, etc.
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

# Copy backend dependency manifests and install production dependencies
COPY AI-Legal_App_BAckend/package*.json ./
RUN npm install --production --legacy-peer-deps

# Copy backend source code (including compiled public static assets)
COPY AI-Legal_App_BAckend/ ./

# Configure Cloud Run environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Expose port for GCP Cloud Run
EXPOSE 8080

# Start backend server (serves API, WebSockets, and SPA frontend)
CMD ["node", "server.js"]
=======
# Build Stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Accept build-time env variables
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY . .
RUN npm run build

# Serve Stage (Nginx)
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY entrypoint.sh /
RUN sed -i 's/\r$//' /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> c9e07ffc6999687175e12f3f1b4540ebb90d6e06
