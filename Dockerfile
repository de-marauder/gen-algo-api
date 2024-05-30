# Stage 1 - Build stage
FROM node:alpine as build

WORKDIR /app

COPY package*.json ./
COPY . .

RUN yarn install

RUN yarn build

# Stage 2 - Runner
FROM node:alpine 

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/fcm-service-account.json ./fcm-service-account.json

RUN apk add curl
RUN yarn install --production

ENV PORT=8000

EXPOSE $PORT
CMD ["yarn", "prod"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 CMD curl -f "http://localhost:$PORT/api/health" || exit 1
