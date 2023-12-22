FROM node:18-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package.json ./

RUN yarn install --only=production

COPY . .

ARG ENV_VARIABLE
ENV ENV_VARIABLE=${ENV_VARIABLE}
ARG NEXT_PUBLIC_ENV_VARIABLE
ENV NEXT_PUBLIC_ENV_VARIABLE=${NEXT_PUBLIC_ENV_VARIABLE}

RUN yarn build

CMD ["yarn", "start"]
