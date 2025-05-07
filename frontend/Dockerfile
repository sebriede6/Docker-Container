# Stage 1: Build
FROM node:lts-alpine AS builder
WORKDIR /app

# Kopiere nur die Package-Dateien, um den Cache zu nutzen
COPY package.json package-lock.json ./
RUN npm ci

# Kopiere den Rest des Codes und baue die Anwendung
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN echo "VITE_API_URL im Docker-Build-Kontext: $VITE_API_URL"
RUN npm run build

# Stage 2: Serve mit Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80