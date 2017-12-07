FROM node:6.12.1-alpine

RUN apk update
RUN apk add ffmpeg
RUN apk add curl make g++ python python-dev gcc musl-dev

WORKDIR /app
ADD *.js /app/
ADD *.json /app/
RUN cd /app
RUN npm install

EXPOSE 8081

CMD ["npm", "start"]