export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface MessageResponse {
  code: number;
  message: string;
}

export interface BaseResponse {
  code: number;
  message: string;
}

export interface BaseResponseWithData<T> extends BaseResponse {
  data: T;
}

export interface PaginatedListResponse<T> extends BaseResponse {
  data: {
    list: T[];
    pagination: Pagination;
  };
}
