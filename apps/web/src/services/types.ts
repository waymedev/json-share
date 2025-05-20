export interface Pagination {
  page: number;
  size: number;
  total_records: number;
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
