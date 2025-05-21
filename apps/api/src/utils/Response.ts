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
  list: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

/**
 * 分享文件数据接口
 */
export interface FileData {
  id: number;
  file_name: string;
  share_id: string;
  json_id: number;
  json_content?: any;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
  is_shared: boolean;
}

/**
 * 用户文件简略信息接口
 */
export interface UserFileInfo {
  id: number;
  file_name: string;
  share_id?: string;
  is_shared: boolean;
  created_at: number;
  expired_at: number | null;
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
