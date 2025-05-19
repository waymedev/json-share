import { Context, Next } from "koa";
import { HttpError } from "../utils/HttpError";
import { errorResponse } from "../utils/Response";
import { logger } from "../utils/logger";

export function errorHandler(env: "production" | "development") {
  return async function (ctx: Context, next: Next) {
    try {
      await next();

      // 处理 404：如果没有任何中间件写响应体，则抛出 404
      if (ctx.status === 404 && !ctx.body) {
        logger.warn(`404 Not Found: ${ctx.method} ${ctx.url}`);
        ctx.throw(404, "Resource Not Found");
      }
    } catch (err: any) {
      // 业务中抛出的 HttpError
      const isHttpError =
        err instanceof HttpError || typeof err.status === "number";
      const status = isHttpError ? err.status : 500;
      const message = isHttpError ? err.message : "Internal Server Error";

      // Log the error
      if (status >= 500) {
        logger.error(`Server Error: ${ctx.method} ${ctx.url}`, err);
      } else {
        logger.warn(
          `Client Error (${status}): ${ctx.method} ${ctx.url} - ${message}`
        );
      }

      ctx.status = status;
      ctx.body = errorResponse(message, status);

      // 触发 app.on('error')，交给日志/监控
      ctx.app.emit("error", err, ctx);
    }
  };
}
