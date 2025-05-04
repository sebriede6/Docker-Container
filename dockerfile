FROM node:lts-alpine AS builder


WORKDIR /app


COPY package.json package-lock.json ./


RUN npm ci


COPY . .


RUN npm run build


FROM nginx:alpine


RUN rm -rf /usr/share/nginx/html/*


COPY --from=builder /app/dist /usr/share/nginx/html



COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80


HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

