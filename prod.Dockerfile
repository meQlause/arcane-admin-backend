FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/.env ./

COPY package*.json ./

RUN yarn install --only=production

RUN rm package*.json

EXPOSE 4000

CMD ["node", "dist/src/main.js"]
