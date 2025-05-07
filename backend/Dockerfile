FROM node:lts-alpine
WORKDIR /app

# Kopiere zuerst package.json und package-lock.json für besseres Caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Kopiere den gesamten restlichen Code (inklusive src/ und server.js)
# Da WORKDIR /app ist, wird alles aus dem Build-Kontext (backend/)
# nach /app im Container kopiert.
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]