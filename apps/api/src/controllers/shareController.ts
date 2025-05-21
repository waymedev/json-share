import multer from "@koa/multer";
import Router from "koa-router";
import { ShareService } from "../services";
import { successResponse } from "../utils/Response";
import {
  ErrorType,
  handleApiError,
  requireUserId,
} from "../utils/errorHandler";

const upload = multer();
const router = new Router({ prefix: "/api" });

interface FileUploadBody {
  filename: string;
  expiration_days?: string;
}

/**
 * 上传文件并创建分享
 * @param ctx Koa context object
 * @returns void
 */
router.post("/shares", upload.single("file"), async (ctx) => {
  const userId = requireUserId(ctx);
  if (!userId) return; // 如果验证失败，函数已经设置了错误响应

  const file = ctx.request.file;
  const { filename, expiration_days } = ctx.request.body as FileUploadBody;

  if (!file || !filename) {
    handleApiError(ctx, ErrorType.MISSING_FIELDS);
    return;
  }

  // Parse JSON content from the uploaded file
  let jsonContent: any;
  try {
    const fileContent = file.buffer.toString("utf-8");
    jsonContent = JSON.parse(fileContent);
  } catch (error) {
    handleApiError(ctx, ErrorType.INVALID_JSON);
    return;
  }

  // Calculate expiration days if provided
  let expirationDays: number | undefined;
  if (expiration_days) {
    const days = parseInt(expiration_days);
    if (!isNaN(days) && days > 0) {
      expirationDays = days;
    }
  }

  // Create a shared file using the service
  const result = await ShareService.createSharedFile({
    filename,
    json_content: jsonContent,
    user_id: userId,
    expiration_days: expirationDays,
  });

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
 * 获取分享列表
 * @param ctx Koa context object
 * @returns void
 */
router.get("/shares", async (ctx) => {
  const userId = requireUserId(ctx);
  if (!userId) return; // 如果验证失败，函数已经设置了错误响应

  // Parse pagination parameters
  const page = parseInt(ctx.query.page as string) || 1;
  const size = parseInt(ctx.query.size as string) || 20;

  // Parse expired flag
  const expiredOnly = ctx.query.expired === "true";
  const sharedOnly = ctx.query.shared === "true";
  // Get the shared files using the service
  const result = await ShareService.getUserFiles(
    userId,
    page,
    size,
    expiredOnly,
    sharedOnly
  );

  if (result.success && result.data) {
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
 * 获取分享文件
 * @param ctx Koa context object
 * @returns void
 */
router.get("/shares/:shareId", async (ctx) => {
  const { shareId } = ctx.params;

  // Get the shared file using the service
  const result = await ShareService.getSharedFile(shareId);

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
 * 删除分享文件
 * @param ctx Koa context object
 * @returns void
 */
router.delete("/shares/:shareId", async (ctx) => {
  const userId = requireUserId(ctx);
  if (!userId) return; // 如果验证失败，函数已经设置了错误响应

  const { shareId } = ctx.params;

  // Delete the file using ShareService with userId for verification
  const result = await ShareService.deleteSharedFile(shareId, userId);

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

export default router;
