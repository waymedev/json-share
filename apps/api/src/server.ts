import { bodyParser } from "@koa/bodyparser";
import cors from "@koa/cors";
import Koa from "koa";
import Router from "koa-router";
import { koaSwagger } from "koa2-swagger-ui";
import shareRouter from "./controllers/shares";
import { errorHandler } from "./middleware/errorHandler";
import swaggerRouter from "./swagger";
const app = new Koa();
const port = process.env.PORT || 3000;
// 环境判断
const env =
  process.env.NODE_ENV === "production" ? "production" : "development";

// 路由
const router = new Router();

// Error Handler
app.use(errorHandler(env));

// CORS
app.use(
  cors({
    origin: "*", // 允许所有来源访问
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 允许的 HTTP 方法
    allowHeaders: ["Content-Type", "Authorization", "Accept"], // 允许的请求头
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"], // 允许浏览器访问的响应头
    maxAge: 5, // 预检请求的有效期，单位为秒
    credentials: true, // 允许发送 Cookie
    keepHeadersOnError: true, // 当发生错误时是否保留响应头
  })
);

app.on("error", (err, ctx) => {
  // 区分开发/生产
  if (env === "development") {
    console.error("Unhandled error occurred:", err);
  } else {
    // 生产环境只记录必要字段
    console.error({
      message: err.message,
      status: err.status || 500,
      path: ctx.path,
      method: ctx.method,
      // 不暴露堆栈
    });
  }
});

// Routes
router.use(shareRouter.routes(), shareRouter.allowedMethods());
router.use(swaggerRouter.routes(), swaggerRouter.allowedMethods());
app.use(router.routes());

// swagger UI
app.use(
  koaSwagger({
    routePrefix: "/docs", // 文档访问路径前缀
    swaggerOptions: { url: "/swagger.json" },
  })
);

// Middleware
app.use(bodyParser());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
