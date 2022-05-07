FROM node:12-slim

WORKDIR /usr/src/app

COPY ./src/package*.json ./

RUN npm install --production

COPY ./src .

CMD [ "npm", "start" ]