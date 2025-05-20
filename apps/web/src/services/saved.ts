import { apiClient } from "./api";
import type {
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
  is_shared: boolean;
  expiration_days: number;
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
  async saveFile(data: SaveFileRequest): Promise<SaveFileResponseData> {
    return apiClient.post<SaveFileResponseData>("/saved", data);
  },

  async getSavedFiles(
    page: number = 1,
    size: number = 20,
    expiredOnly?: boolean,
    sharedOnly?: boolean
  ): Promise<PaginatedListResponse<SavedListData>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());

    if (expiredOnly !== undefined) {
      params.append("expired_only", expiredOnly.toString());
    }

    if (sharedOnly !== undefined) {
      params.append("shared_only", sharedOnly.toString());
    }

    return apiClient.get<PaginatedListResponse<SavedListData>>(
      `/saved?${params.toString()}`
    );
  },

  async getSavedFileDetail(id: number): Promise<SavedFileDetailData> {
    return apiClient.get<SavedFileDetailData>(`/saved/${id}`);
  },

  async updateSavedFile(
    id: number,
    data: UpdateSavedFileRequest
  ): Promise<MessageResponse> {
    return apiClient.put<MessageResponse>(`/saved/${id}`, data);
  },

  async deleteSavedFile(id: number): Promise<MessageResponse> {
    return apiClient.delete<MessageResponse>(`/saved/${id}`);
  },
};
