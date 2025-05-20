/**
 * API 响应基础接口
 */
export interface ApiResponse<T> {
  code: number;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 分页数据接口
 */
export interface PaginationData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 分享文件数据接口
 */
export interface FileData {
  id: number;
  fileName: string;
  shareId: string;
  jsonId: number;
  jsonContent?: any;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  isShared: boolean;
}

/**
 * 用户文件简略信息接口
 */
export interface UserFileInfo {
  id: number;
  fileName: string;
  shareId?: string;
  isShared: boolean;
  createdAt: number;
  expiredAt: number | null;
}

/**
 * 创建 API 响应
 */
export function createResponse<T>(params: {
  code?: number;
  data?: T;
  message?: string;
  error?: string;
}): ApiResponse<T> {
  return {
    code: params.code || 200,
    data: params.data,
    message: params.message,
    error: params.error,
  };
}

/**
 * 创建成功响应
 *
 * @param data 响应数据
 * @param message 成功消息
 * @returns API 响应对象
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return createResponse({
    code: 200,
    data,
    message,
  });
}

/**
 * 创建错误响应
 *
 * @param error 错误消息
 * @param code HTTP 状态码
 * @returns API 错误响应对象
 */
export function errorResponse(
  error: string,
  code: number = 400
): ApiResponse<null> {
  return createResponse({
    code,
    error,
  });
}
