import { apiClient } from "./api";
import type {
  BaseResponseWithData,
  MessageResponse,
  PaginatedListResponse,
  Pagination,
} from "./types";

export interface SaveFileRequest {
  share_id: string;
  file_name?: string;
}

export interface SaveFileResponseData {
  id: number;
}

export interface SavedItem {
  id: number;
  file_name: string;
  created_at: string;
  updated_at: string;
  share_id: string;
  json_id: number;
  is_shared: boolean;
  is_expired: boolean;
}

export interface SavedListData {
  list: SavedItem[];
  pagination: Pagination;
}

export interface SavedFileDetailData {
  id: number;
  file_name: string;
  json_content: string;
  is_shared: boolean;
  expiration_days: number;
}

export interface UpdateSavedFileRequest {
  file_name?: string;
  is_shared?: boolean;
  expiration_days?: number;
}

export const savedService = {
  async saveFile(
    data: SaveFileRequest
  ): Promise<BaseResponseWithData<SaveFileResponseData>> {
    return apiClient.post<BaseResponseWithData<SaveFileResponseData>>(
      "/saved",
      data
    );
  },

  async getSavedFiles(
    page: number = 1,
    size: number = 20,
    expiredOnly?: boolean,
    sharedOnly?: boolean
  ): Promise<PaginatedListResponse<SavedItem>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());

    if (expiredOnly !== undefined) {
      params.append("expired_only", expiredOnly.toString());
    }

    if (sharedOnly !== undefined) {
      params.append("shared_only", sharedOnly.toString());
    }

    return apiClient.get<PaginatedListResponse<SavedItem>>(
      `/saved?${params.toString()}`
    );
  },

  async getSavedFileDetail(
    id: number
  ): Promise<BaseResponseWithData<SavedFileDetailData>> {
    return apiClient.get<BaseResponseWithData<SavedFileDetailData>>(
      `/saved/${id}`
    );
  },

  async updateSavedFile(
    id: number,
    data: UpdateSavedFileRequest
  ): Promise<BaseResponseWithData<MessageResponse>> {
    return apiClient.put<BaseResponseWithData<MessageResponse>>(
      `/saved/${id}`,
      data
    );
  },

  async deleteSavedFile(id: number): Promise<MessageResponse> {
    return apiClient.delete<MessageResponse>(`/saved/${id}`);
  },
};
