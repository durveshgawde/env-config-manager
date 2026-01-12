FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the Next.js app
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
