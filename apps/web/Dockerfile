# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# 复制package.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# 将构建产物复制到nginx默认目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 暴露80端口
EXPOSE 80

WORKDIR /usr/share/nginx/html
 COPY --from=build /app/dist .

# 运行脚本
ENTRYPOINT sh -c "./vite-envs.sh && nginx -g 'daemon off;'"