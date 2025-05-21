# JSON-Share

一个具备管理与保存功能的高级 JSON 分享服务。

## 系统架构

### 前端 (Vue 3 + TypeScript + Vite)

- 使用 Tailwind CSS 进行样式设计
- 使用 Vue Router 实现路由管理
- 使用 Pinia 进行状态管理

### 后端 (Node.js + Express + MongoDB)

- 使用 Node.js 和 Koa 构建 RESTful API
- 使用 MySQL 存储 JSON 数据和用户信息
- 使用 UUID 进行简化的用户标识

## Docker 部署

项目支持使用 Docker 进行部署：

### 使用 Docker Compose 本地运行

```bash
# 构建并启动所有服务
docker-compose up -d

# 仅构建不启动
docker-compose build

# 单独启动服务
docker-compose up -d web
docker-compose up -d api
```

### 手动构建镜像

```bash
# 构建前端镜像
cd apps/web
docker build -t json-share-web .

# 构建后端镜像
cd apps/api
docker build -t json-share-api .
```

### CI/CD

项目配置了 GitHub Actions 工作流，自动构建并发布 Docker 镜像到 GitHub Container Registry：

- `json-share-web`: 前端镜像
- `json-share-api`: 后端镜像

镜像会在以下情况下自动构建：

- 推送到 main 分支时（如果有相关文件更改）
- 发布新版本时
- 手动触发工作流

## 功能实现

### 1. 用户标识系统

- 前端首次访问时生成 UUID，存储在 LocalStorage 中
- 每次请求时通过请求头 `X-User-ID` 将 UUID 发送给后端
- 后端根据此 UUID 识别用户，管理其分享和保存的内容

### 2. JSON 上传与分享

- 文件上传组件，限制只接受 `.json` 文件
- 实现文件验证，确保上传的是有效的 JSON 文件
- 上传成功后，根据用户选择的有效期（1 天、7 天、永久）生成唯一分享链接
- 分享链接格式：`/share/{unique-id}`

### 3. JSON 预览与下载

- 实现带有语法高亮和可折叠树状视图的 JSON 预览功能
  - 使用 `vue-json-viewer` 或自定义组件实现
  - 针对大型 JSON (5-10MB) 实现懒加载和虚拟滚动优化
- 提供下载原始 JSON 文件的功能
- 实现"保存此 JSON"功能，允许访问者将 JSON 保存到自己的列表中
- 处理链接过期或无效的情况，显示相应提示

### 4. "我的分享"管理

- 实现用户分享列表页面，显示：
  - 分享链接
  - JSON 文件名
  - 创建时间
  - 过期时间
- 提供取消分享的功能

## 数据模型

## API 设计

### 分享相关

- `POST /api/shares` - 上传并创建分享
- `GET /api/shares` - 获取分享列表
- `GET /api/shares/:share_id` - 获取单个分享内容
- `DELETE /api/shares/:id` - 删除特定分享

### 收藏相关

- `POST /api/saved` - 收藏文件
- `GET /api/saved` - 获取收藏列表
- `GET /api/saved/:id` - 查看收藏文件
- `PUT /api/saved/:id` - 更新收藏文件
- `DELETE /api/saved/:id` - 删除已保存的 JSON

## 前端路由设计

- `/` - 首页，上传 JSON 并创建分享
- `/share/:id` - 分享预览页面
- `/library` - 我的分享管理页面

## 性能优化

针对中等大小 JSON (5-10MB)的预览性能优化：

1. 实现虚拟滚动，只渲染可视区域的 JSON 节点
2. 实现懒加载，初始只展开第一层节点
3. 使用 Web Worker 进行 JSON 解析，避免阻塞主线程
4. 实现分块渲染，避免一次性渲染大量 DOM 节点

## 实现步骤

1. 设置项目结构，添加必要的依赖
2. 实现后端 API 和数据库模型
3. 实现前端用户界面和交互逻辑
4. 实现 JSON 预览组件，优化大型 JSON 的性能
5. 实现用户标识系统
6. 测试和优化

## 技术栈总结

### 前端

- Vue 3 + TypeScript
- Tailwind CSS
- Vue Router
- Pinia
- JSON 预览组件/懒加载/虚拟滚动第三方库

### 后端

- Node.js + Koa
- MySQL
- JWT/UUID
