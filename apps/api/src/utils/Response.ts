interface ApiResponse<T> {
    code: number;
    data?: T;
    message?: string;
    error?: string;
  }
  
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
  
  export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
    return createResponse({
      code: 200,
      data,
      message,
    });
  }
  
  export function errorResponse(error: string, code: number = 400): ApiResponse<null> {
    return createResponse({
      code,
      error,
    });
  }