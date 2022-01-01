FROM node:14.15.4-alpine3.12

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i -g npm@latest
RUN npm install && npm cache clean --force

COPY . .

CMD ["npm", "start"]
