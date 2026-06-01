FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3003
ENV ORDER_SERVICE_URL=http://order-service:3002
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
EXPOSE 3003
CMD ["npm", "start"]
