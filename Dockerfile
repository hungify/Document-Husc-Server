FROM node:16.15.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm install -g pm2

EXPOSE 8000

CMD ["npm", "start"]
