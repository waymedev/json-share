import { errorResponse } from "./Response";

/**
 * 预定义错误类型及其对应的 HTTP 状态码
 */
export enum ErrorType {
  // 客户端错误 (4xx)
  BAD_REQUEST = "BAD_REQUEST", // 400
  UNAUTHORIZED = "UNAUTHORIZED", // 401
  FORBIDDEN = "FORBIDDEN", // 403
  NOT_FOUND = "NOT_FOUND", // 404
  CONFLICT = "CONFLICT", // 409
  VALIDATION_ERROR = "VALIDATION_ERROR", // 422

  // 服务器错误 (5xx)
  INTERNAL_ERROR = "INTERNAL_ERROR", // 500
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE", // 503

  // 业务逻辑错误 (自定义)
  FILE_EXPIRED = "FILE_EXPIRED", // 404
  INVALID_JSON = "INVALID_JSON", // 400
  MISSING_USER_ID = "MISSING_USER_ID", // 400
  MISSING_FIELDS = "MISSING_FIELDS",
  FILE_NOT_SHARED = "FILE_NOT_SHARED", // 400
}

/**
 * 错误类型到 HTTP 状态码的映射
 */
const ERROR_STATUS_MAP: Record<ErrorType, number> = {
  // 客户端错误
  [ErrorType.BAD_REQUEST]: 400,
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.VALIDATION_ERROR]: 422,

  // 服务器错误
  [ErrorType.INTERNAL_ERROR]: 500,
  [ErrorType.SERVICE_UNAVAILABLE]: 503,

  // 业务逻辑错误
  [ErrorType.FILE_EXPIRED]: 404,
  [ErrorType.INVALID_JSON]: 400,
  [ErrorType.MISSING_USER_ID]: 400,
  [ErrorType.MISSING_FIELDS]: 400,
  [ErrorType.FILE_NOT_SHARED]: 400,
};

/**
 * 错误类型到默认错误消息的映射
 */
const DEFAULT_ERROR_MESSAGES: Record<ErrorType, string> = {
  // 客户端错误
  [ErrorType.BAD_REQUEST]: "Bad request",
  [ErrorType.UNAUTHORIZED]: "Unauthorized",
  [ErrorType.FORBIDDEN]: "Forbidden",
  [ErrorType.NOT_FOUND]: "Resource not found",
  [ErrorType.CONFLICT]: "Resource conflict",
  [ErrorType.VALIDATION_ERROR]: "Validation error",

  // 服务器错误
  [ErrorType.INTERNAL_ERROR]: "Internal server error",
  [ErrorType.SERVICE_UNAVAILABLE]: "Service unavailable",

  // 业务逻辑错误
  [ErrorType.FILE_EXPIRED]: "This shared file has expired",
  [ErrorType.INVALID_JSON]: "Invalid JSON file",
  [ErrorType.MISSING_USER_ID]: "Missing user_id header",
  [ErrorType.MISSING_FIELDS]: "Missing required fields",
  [ErrorType.FILE_NOT_SHARED]: "This file is not shared",
};

/**
 * 错误数据接口
 */
export interface ErrorData {
  field?: string;
  reason?: string;
  [key: string]: any;
}

/**
 * 处理 API 错误并设置适当的响应
 *
 * @param ctx Koa 上下文对象
 * @param errorType 预定义的错误类型
 * @param message 自定义错误消息 (可选)
 * @param data 附加错误数据 (可选)
 */
export function handleApiError(
  ctx: any,
  errorType: ErrorType,
  message?: string,
  data?: ErrorData
): void {
  // 获取错误类型对应的状态码
  const status = ERROR_STATUS_MAP[errorType];

  // 设置 HTTP 状态码
  ctx.status = status;

  // 使用自定义消息或默认消息
  const errorMessage = message || DEFAULT_ERROR_MESSAGES[errorType];

  // 设置错误响应
  ctx.body = errorResponse(errorMessage, status);

  // 如果有附加数据，添加到响应中
  if (data) {
    (ctx.body as any).data = data;
  }
}

/**
 * 提取并验证用户 ID
 *
 * @param ctx Koa context 对象
 * @returns 用户 ID 或 null (如果验证失败)
 */
export function requireUserId(ctx: any): string | null {
  const userId = ctx.request.header["x-user-id"];

  if (!userId) {
    handleApiError(ctx, ErrorType.MISSING_USER_ID);
    return null;
  }

  return userId.toString();
}
