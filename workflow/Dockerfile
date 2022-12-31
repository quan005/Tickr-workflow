FROM node:latest

WORKDIR /app
COPY package.json .
RUN npm install --only=prod --legacy-peer-deps && npm install -g typescript
COPY . .
RUN npm run build
EXPOSE 8080

CMD ["npm", "start"]