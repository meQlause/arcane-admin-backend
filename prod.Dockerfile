FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 4000

CMD ["yarn", "run", "start:prod"]
