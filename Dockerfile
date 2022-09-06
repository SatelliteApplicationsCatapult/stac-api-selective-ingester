FROM node:16
WORKDIR /usr/src/app
RUN apt-get update -y
RUN apt-get upgrade -y
COPY . .
RUN npm install
EXPOSE 80/tcp
CMD ["npm", "run", "start"]