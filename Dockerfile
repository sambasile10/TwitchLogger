FROM node:16.6.2-alpine

#Environment variables
ENV TIME_ZONE=Mountain/US

#Create directory for container
WORKDIR /usr/src/app

COPY package.json .
RUN npm install && npm install typescript -g

#Compile
ADD . /usr/src/app
RUN npx tsc

EXPOSE 8080
CMD [ "node", "src/App/app.js" ]
