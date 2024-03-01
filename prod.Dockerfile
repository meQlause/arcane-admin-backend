FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY package*.json ./

RUN yarn install --only=production

EXPOSE 4000

CMD ["yarn", "run", "start:prod"]
