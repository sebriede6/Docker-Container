FROM node:lts-alpine

RUN apk add --no-cache wget ca-certificates

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]