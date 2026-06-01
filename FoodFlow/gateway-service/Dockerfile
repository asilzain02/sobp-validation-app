FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV FOOD_SERVICE_URL=http://food-service:3001
ENV ORDER_SERVICE_URL=http://order-service:3002
ENV PAYMENT_SERVICE_URL=http://payment-service:3003
ENV TRACKING_SERVICE_URL=http://tracking-service:3004
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
EXPOSE 8080
CMD ["npm", "start"]
