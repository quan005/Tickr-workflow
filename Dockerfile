FROM node:latest

WORKDIR /app
COPY package.json .
RUN npm install --only=prod --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 9090

CMD ["npm", "start"]