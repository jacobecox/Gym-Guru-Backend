FROM node:16.6.2-bullseye-slim

# Create app directory
WORKDIR /src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 5000

CMD [ "node", "server.js" ]