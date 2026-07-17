FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g pm2

# Expose ports for all microservices and gateway
EXPOSE 6999 7001 7002

CMD ["pm2-runtime", "ecosystem.config.js"]
