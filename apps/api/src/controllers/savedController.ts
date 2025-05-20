import Router from "koa-router";
import { SavedService } from "../services/savedService";
import { successResponse } from "../utils/Response";
import {
  ErrorType,
  handleApiError,
  requireUserId,
} from "../utils/errorHandler";

const router = new Router({ prefix: "/api" });

interface SaveFileBody {
  share_id: string;
  file_name: string;
}

interface UpdateFileBody {
  file_name?: string;
  is_shared?: boolean;
  expiration_days?: number;
}

/**
 * 收藏文件
 * @param ctx Koa context object
 * @returns void
 */
router.post("/saved", async (ctx) => {
  const userId = requireUserId(ctx);
  if (!userId) return;

  const { share_id, file_name } = ctx.request.body as SaveFileBody;

  if (!share_id) {
    handleApiError(ctx, ErrorType.MISSING_FIELDS);
    return;
  }

  // Save the file using SavedService
  const result = await SavedService.saveFile(share_id, userId, file_name);

  if (result.success) {
    ctx.body = successResponse(result.data, result.message);
  } else {
    // 使用服务返回的错误类型
    handleApiError(
      ctx,
      result.errorType || ErrorType.INTERNAL_ERROR,
      result.message
    );
  }
});

/** 查看收藏文件
 * @param ctx Koa context object
 * @returns void
 */
router.get("/saved/:id", async (ctx) => {
  const userId = requireUserId(ctx);
  if (!userId) return;

  const id = parseInt(ctx.params.id);
  if (isNaN(id)) {
    handleApiError(ctx, ErrorType.BAD_REQUEST, "Invalid ID format");
    return;
  }

  const result = await SavedService.getSavedFile(id, userId);

  if (result.success) {
    ctx.body = successResponse(result.data, result.message);
  } else {
    handleApiError(
      ctx,
      result.errorType || ErrorType.INTERNAL_ERROR,
      result.message
    );
  }
});

/**
 * 获取收藏列表
 * @param ctx Koa context object
 * @returns void
 */
router.get("/saved", async (ctx) => {
  const userId = requireUserId(ctx);
  if (!userId) return; // 如果验证失败，函数已经设置了错误响应

  // Parse pagination parameters
  const page = parseInt(ctx.query.page as string) || 1;
  const size = parseInt(ctx.query.size as string) || 20;

  const expiredOnly = ctx.query.expired_only === "true";
  const sharedOnly = ctx.query.shared_only === "true";

  // Get the saved files using the service
  const result = await SavedService.getSavedFiles(
    userId,
    page,
    size,
    expiredOnly,
    sharedOnly
  );

  if (result.success) {
    ctx.body = successResponse(result.data, result.message);
  } else {
    // 使用服务返回的错误类型
    handleApiError(
      ctx,
      result.errorType || ErrorType.INTERNAL_ERROR,
      result.message
    );
  }
});

/**
 * 取消收藏
 * @param ctx Koa context object
 * @returns void
 */
router.delete("/saved/:id", async (ctx) => {
  const userId = requireUserId(ctx);
  if (!userId) return; // 如果验证失败，函数已经设置了错误响应

  const id = parseInt(ctx.params.id);
  if (isNaN(id)) {
    handleApiError(ctx, ErrorType.BAD_REQUEST, "Invalid ID format");
    return;
  }

  // Remove the saved file using SavedService
  const result = await SavedService.removeSavedFile(id, userId);

  if (result.success) {
    ctx.body = successResponse(null, result.message);
  } else {
    // 使用服务返回的错误类型
    handleApiError(
      ctx,
      result.errorType || ErrorType.INTERNAL_ERROR,
      result.message
    );
  }
});

/**
 * 更新收藏文件
 * @param ctx Koa context object
 * @returns void
 */
router.put("/saved/:id", async (ctx) => {
  const userId = requireUserId(ctx);
  if (!userId) return; // 如果验证失败，函数已经设置了错误响应

  const id = parseInt(ctx.params.id);
  if (isNaN(id)) {
    handleApiError(ctx, ErrorType.BAD_REQUEST, "Invalid ID format");
    return;
  }

  const { file_name, is_shared, expiration_days } = ctx.request
    .body as UpdateFileBody;

  // Update the saved file using the service
  const result = await SavedService.updateSavedFile(id, userId, {
    fileName: file_name,
    isShared: is_shared,
    expirationDays: expiration_days,
  });
});

export default router;
