import { apiClient } from "./api";
import type { MessageResponse, Pagination } from "./types";

export interface ShareRequest {
  file: File;
  filename: string;
  expirationDays?: number;
}

export interface ShareResponseData {
  share_id: string;
}

export interface ShareItem {
  id: number;
  filename: string;
  created_at: string;
  updated_at: string;
  share_id: string;
  is_shared: boolean;
}

export interface SharesListData {
  list: ShareItem[];
  pagination: Pagination;
}

export type SharesListResponse = SharesListData;

export interface ShareDetailData {
  id: number;
  json_content: string;
}

export type ShareDetailResponse = ShareDetailData;

export interface FormattedShareResponse {
  share_id: string;
  share_url: string;
  message: string;
}

const formatShareResponse = (
  shareId: string,
  host: string
): FormattedShareResponse => {
  return {
    share_id: shareId,
    share_url: `${host}/share/${shareId}`,
    message: "success",
  };
};

export const sharesService = {
  async shareFile(data: ShareRequest): Promise<FormattedShareResponse> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("filename", data.filename);
    formData.append("expiration_days", data.expirationDays?.toString() || "0");

    const response = await apiClient.post<ShareResponseData>(
      "/shares",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const host = window.location.origin;
    return formatShareResponse(response.share_id, host);
  },

  async getShares(
    page: number = 1,
    size: number = 20,
    expired?: boolean,
    shared?: boolean
  ): Promise<SharesListResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());

    if (expired !== undefined) {
      params.append("expired", expired.toString());
    }

    if (shared !== undefined) {
      params.append("shared", shared.toString());
    }

    return apiClient.get<SharesListResponse>(`/shares?${params.toString()}`);
  },

  async getShareDetail(shareId: string): Promise<ShareDetailResponse> {
    return apiClient.get<ShareDetailResponse>(`/shares/${shareId}`);
  },

  async deleteShare(shareId: string): Promise<MessageResponse> {
    return apiClient.delete<MessageResponse>(`/shares/${shareId}`);
  },
};
