FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV FOOD_SERVICE_URL=http://food-service:3001
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
EXPOSE 3002
CMD ["npm", "start"]
