FROM node:20.19.4-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# 安装 ZeroMQ 依赖
RUN apk add --no-cache zeromq-dev python3 make g++

COPY src/ ./src/
CMD ["node", "src/index.js"]