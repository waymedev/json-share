# JSON-Share

一个具备管理与保存功能的高级 JSON 分享服务。

[系统简介](https://github.com/waymedev/json-share/blob/main/docs/系统简介.md)

[AI 感想](https://github.com/waymedev/json-share/blob/main/docs/AI使用感想.md)


```
# 主页面
http://loaclhost:8080

# swagger 文档
http://localhost:3000/docs

```

## 本地开发

```bash
cd apps/web
pnpm install
pnpm run dev

cd apps/api
pnpm install
pmpm run dev
```

后端接口单元测试&数据库集成测试
```bash
cd app/api
pnpm test
```

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

`init.sql`文件与`docker-compose.ymal`在同一文件

### 手动构建镜像

```bash
# 构建前端镜像
cd apps/web
docker build -t json-share-web .

# 构建后端镜像
cd apps/api
docker build -t json-share-api .
```

## 1. 项目概览
| 维度 | 内容 |
| --- | --- |
| **项目目标** | 一款容器化部署的 **JSON 分享平台**，支持上传、分享、预览、保存、副本管理与过期清理 |
| **核心技术** | Vue 3 · Pinia · TypeScript · Koa2 · MySQL · Docker Compose |
| **辅助工具** | ChatGPT (o4-mini-high)、JetBrains Junie、v0.dev、Cursor.dev |

## 2. 工具链 & 角色分工
| 环节 | 工具 & 版本 | 关键价值                      |
| --- | --- |---------------------------|
| **需求拆解** | ChatGPT + Junie (任务面板) | GPT 提炼需求主干，Junie 自动生成可勾选子任务 |
| **UI 原型 / 低代码** | v0.dev | 生成首页、详情页、用户保存页雏形          |
| **DB & API 设计** | ChatGPT (o4-mini-high) | 生成 Drizzle ORM 初始化脚本及 Swagger 摘要 |
| **编码 & 重构** | Cursor IDE | AI 代码补全   |
| **测试** | GPT 生成测试计划 → Cursor 生成 Vitest 文件 | service 层 & DAO 层覆盖 |
| **CI/CD & Docker** | Cursor + GitHub Actions | actions/setup-buildx 打多平台镜像，自动推送 GHCR |


## 4. 已实现功能对照
| 模块 | 进度 | 亮点                                    |
| --- | -- |---------------------------------------|
| 上传 & 分享 | ✅ | 文件校验&过期无效                             |
| JSON 预览 | ✅ | 语法高亮、折叠、第三方库虚拟滚动                      |
| 保存副本 | ✅ | 引入 `json_file` 表，保证跨用户隔离              |
| 我的分享 / 我的 JSON | ✅ | 列表 + 删除                               |
| 简化登录态 | ✅ | 匿名 UUID + `X-User-ID` |
| 过期清理 |  | CRON 每小时 + 惰性校验双保险                    |
| CI / Docker | ✅ | `docker-compose up -d` 一键起 3 服务       |
| 单元 / 集成测试 | 82 % 覆盖 | DAO Mock + Supertest 打 API            |

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
- UUID
