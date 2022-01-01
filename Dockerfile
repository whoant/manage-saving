FROM node:14.15.4-alpine3.12

WORKDIR /app

RUN npm i npm@latest -g
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
