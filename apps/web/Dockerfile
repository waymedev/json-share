# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# 复制package.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用（忽略TypeScript错误）
RUN npm run build:ignore-errors

# Production stage
FROM nginx:alpine AS production

# 将构建产物复制到nginx默认目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 