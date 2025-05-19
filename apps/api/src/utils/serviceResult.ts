import { ErrorType } from "./errorHandler";

/**
 * 通用服务结果接口
 */
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorType?: ErrorType;
}

/**
 * 创建成功结果
 *
 * @param data 返回数据
 * @param message 成功消息
 * @returns 成功的服务结果
 */
export function successResult<T>(data?: T, message?: string): ServiceResult<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * 创建错误结果
 *
 * @param errorType 错误类型
 * @param message 错误消息（可选，如不提供则使用默认消息）
 * @param data 附加数据（可选）
 * @returns 错误的服务结果
 */
export function errorResult<T = any>(
  errorType: ErrorType,
  message?: string,
  data?: T
): ServiceResult<T> {
  return {
    success: false,
    errorType,
    message,
    data,
  };
}
