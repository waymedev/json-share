import { api } from "./api";

export interface ShareRequest {
  file: File;
  filename: string;
  expirationDays?: number;
  userId: string;
  // Add other share parameters as needed
}

export interface ShareResponse {
  shareId: string;
  filename: string;
  expiresAt: string | null;
}

export interface FormattedShareResponse {
  filename: string;
  expiresAt: Date | null;
  shareUrl: string;
  rawResponse: ShareResponse;
}

const formatShareResponse = (
  response: ShareResponse,
  host: string
): FormattedShareResponse => {
  return {
    filename: response.filename,
    expiresAt: response.expiresAt ? new Date(response.expiresAt) : null,
    shareUrl: `${host}/share/${response.data.share_id}`,
    rawResponse: response,
  };
};

export const sharesService = {
  async shareFile(data: ShareRequest): Promise<FormattedShareResponse> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("filename", data.filename);
    formData.append("expiration_days", data.expirationDays?.toString() || "0");
    formData.append("user_id", data.userId);

    const response = await api.post<ShareResponse>("/shares", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("shareFile response", response.data);

    const host = window.location.origin;
    return formatShareResponse(response.data, host);
  },
};
