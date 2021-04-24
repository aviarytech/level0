FROM node:12-stretch
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY . . 
RUN npm install
EXPOSE 21380
CMD ["node", "index.js"]
