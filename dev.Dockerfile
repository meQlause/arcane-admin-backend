FROM node:alpine3.18
WORKDIR /arcane-backend
COPY ./package.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD [ "npm", "run" , "start:dev" ]