FROM node:20-slim

WORKDIR /app

# 依存を先に入れてキャッシュ効かせる
COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# どこからでもcsv2shpが叩ける
ENTRYPOINT ["csv2shp"]
