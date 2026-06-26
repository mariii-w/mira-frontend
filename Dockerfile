#build
FROM node:24-alpine AS frontend-build

WORKDIR /frontend

RUN corepack enable

COPY ./package.json ./package-lock.json ./

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://mira-uni-deploy.onrender.com

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run openapi

RUN npm run build


#deploy
FROM ethelin17/mira-uni-deploy:latest

WORKDIR /app

COPY --from=frontend-build /frontend/dist ./dist

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -jar app.jar --spring.profiles.active=postgres --server.address=0.0.0.0 --server.port=${PORT:-10000}"]
