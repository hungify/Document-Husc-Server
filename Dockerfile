FROM node:16.15.0-alpine

WORKDIR /app

COPY . .

RUN yarn

EXPOSE 3000

CMD ["yarn", "dev"]
