FROM node:16.15.0-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm i

RUN npm install -g pm2

EXPOSE 8000

CMD ["npm", "start"]
