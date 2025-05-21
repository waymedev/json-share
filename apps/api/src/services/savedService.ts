import { randomUUID } from "node:crypto";
import { RawJsonModel } from "../db/rawJsonModel";
import { UserFileModel } from "../db/userFileModel";
import { FileData, PaginationData } from "../utils/Response";
import { isExpired } from "../utils/commonUtils";
import { ErrorType } from "../utils/errorHandler";
import {
  errorResult,
  ServiceResult,
  successResult,
} from "../utils/serviceResult";
import { ShareService } from "./shareService";

/**
 * Service class for handling saved file operations
 */
export class SavedService {
  /**
   * Save a file to the user's favorites
   * @param shareId The share ID of the file to save
   * @param userId The ID of the user saving the file
   * @returns ServiceResult with saved file data
   */
  static async saveFile(
    share_id: string,
    user_id: string,
    file_name: string
  ): Promise<ServiceResult<{ id: number }>> {
    try {
      // Create user file record

      // First verify the shared file exists
      const sharedFileResult = await ShareService.getSharedFile(share_id);

      if (!sharedFileResult.success) {
        return errorResult(
          sharedFileResult.errorType || ErrorType.NOT_FOUND,
          "Shared file not found or cannot be accessed"
        );
      }

      const newShareId = randomUUID();

      // Create a new record in user_files for the saved file
      // Use the same jsonId as the original file to avoid duplicating content
      const savedFile = {
        fileName: file_name,
        userId: user_id,
        jsonId: sharedFileResult.data?.json_id || 0,
        shareId: newShareId,
        isShared: 0,
        expiredAt: 0,
      };

      const result = await UserFileModel.createUserFile(savedFile);

      return successResult(result, "File saved successfully");
    } catch (error) {
      console.error("Error saving file:", error);
      return errorResult(ErrorType.INTERNAL_ERROR, "Failed to save file");
    }
  }

  /**
   * Get user's saved files with pagination
   * @param userId The ID of the user
   * @param page The page number (starting from 1)
   * @param size The number of items per page
   * @returns ServiceResult with paginated saved files
   */
  static async getSavedFiles(
    userId: string,
    page: number,
    size: number,
    expiredOnly: boolean,
    sharedOnly: boolean
  ): Promise<ServiceResult<PaginationData<FileData>>> {
    try {
      const userFiles = await ShareService.getUserFiles(
        userId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );

      if (!userFiles.success) {
        return errorResult(
          userFiles.errorType || ErrorType.NOT_FOUND,
          "Saved files not found"
        );
      }

      // Get total count of records for pagination
      const totalRecords = await UserFileModel.getUserFilesCount(
        userId,
        expiredOnly,
        sharedOnly
      );

      return successResult(
        {
          list: userFiles.data?.list || [],
          pagination: {
            page: page,
            page_size: size,
            total: totalRecords,
            total_pages: Math.ceil(totalRecords / size),
          },
        },
        "Saved files retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting saved files:", error);
      return errorResult(ErrorType.INTERNAL_ERROR, "Failed to get saved files");
    }
  }

  /**
   * Remove a file from user's saved files
   * @param id The ID of the saved file to remove
   * @param userId The ID of the user
   * @returns ServiceResult with success message
   */
  static async removeSavedFile(
    id: number,
    userId: string
  ): Promise<ServiceResult> {
    try {
      // Get the file details first to verify ownership
      const userFiles = await UserFileModel.getUserFilesByUserId(userId);

      // Find the specific file by ID
      const userFile = userFiles.find((file) => file.id === id);

      if (!userFile) {
        return errorResult(
          ErrorType.NOT_FOUND,
          "Saved file not found or you don't have permission to remove it"
        );
      }

      // Delete the saved file
      await UserFileModel.deleteUserFile(id);

      return successResult(null, "File removed from saved items successfully");
    } catch (error) {
      console.error("Error removing saved file:", error);
      return errorResult(
        ErrorType.INTERNAL_ERROR,
        "Failed to remove saved file"
      );
    }
  }

  /**
   * Update a saved file
   * @param id The ID of the saved file to update
   * @param userId The ID of the user
   * @param updateData The data to update
   * @returns ServiceResult with updated file data
   */
  static async updateSavedFile(
    id: number,
    userId: string,
    updateData: {
      file_name?: string;
      is_shared?: boolean;
      expiration_days?: number;
    }
  ): Promise<ServiceResult> {
    try {
      // Get the file details first to verify ownership
      const userFiles = await UserFileModel.getUserFilesByUserId(userId);

      // Find the specific file by ID
      const userFile = userFiles.find((file) => file.id === id);

      if (!userFile) {
        return errorResult(ErrorType.NOT_FOUND, "Saved file not found");
      }

      // Update the file record with all required properties
      const updatedFile = {
        ...userFile, // Include all existing properties
        fileName: updateData.file_name || userFile.fileName,
        isShared: updateData.is_shared ? 1 : 0,
        expiredAt: updateData.expiration_days
          ? Date.now() + updateData.expiration_days * 24 * 60 * 60 * 1000
          : userFile.expiredAt,
      };

      // Update the user file record
      await UserFileModel.updateUserFile(id, updatedFile);

      return successResult(null, "File updated successfully");
    } catch (error) {
      console.error("Error updating saved file:", error);
      return errorResult(
        ErrorType.INTERNAL_ERROR,
        "Failed to update saved file"
      );
    }
  }

  /**
   * Get a saved file by ID
   * @param id The ID of the saved file
   * @param userId The ID of the user
   * @returns ServiceResult with saved file data
   */
  static async getSavedFile(
    id: number,
    userId: string
  ): Promise<ServiceResult<FileData>> {
    try {
      const userFiles = await UserFileModel.getUserFilesByUserId(userId);
      const userFile = userFiles.find((file) => file.id === id);

      if (!userFile) {
        return errorResult(ErrorType.NOT_FOUND, "Saved file not found");
      }

      // Get the JSON content
      const jsonContent = await RawJsonModel.getById(userFile.jsonId);

      if (!jsonContent) {
        return errorResult(ErrorType.NOT_FOUND, "File content not found");
      }

      const fileData: FileData = {
        id: userFile.id,
        file_name: userFile.fileName,
        json_content: jsonContent.jsonContent,
        json_id: userFile.jsonId,
        share_id: userFile.shareId || "",
        created_at: userFile.createdAt,
        updated_at: userFile.updatedAt,
        is_expired: isExpired(userFile.expiredAt),
        is_shared: userFile.isShared === 1,
      };

      return successResult(fileData, "Saved file retrieved successfully");
    } catch (error) {
      console.error("Error getting saved file:", error);
      return errorResult(ErrorType.INTERNAL_ERROR, "Failed to get saved file");
    }
  }
}
