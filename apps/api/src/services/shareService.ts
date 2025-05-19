import { randomUUID } from "crypto";
import { db } from "../db";
import { RawJsonModel } from "../db/rawJsonModel";
import { UserFileModel } from "../db/userFileModel";
import { ShareFileData } from "../utils/Response";
import { isExpired } from "../utils/commonUtils";
import { ErrorType } from "../utils/errorHandler";
import {
  errorResult,
  ServiceResult,
  successResult,
} from "../utils/serviceResult";
interface FileUploadData {
  filename: string;
  jsonContent: any;
  userId: string;
  expirationDays?: number;
}

/**
 * Service class for handling shared file operations
 */
export class ShareService {
  /**
   * Create a new shared file
   * @param data The file data to share
   * @returns ServiceResult with share ID
   */
  static async createSharedFile(
    data: FileUploadData
  ): Promise<ServiceResult<{ shareId: string }>> {
    try {
      // Create a unique share ID
      const shareId = randomUUID();

      // Calculate expiration date if provided
      let expiredAt = 0;
      if (data.expirationDays && data.expirationDays > 0) {
        const timestamp =
          Date.now() + data.expirationDays * 24 * 60 * 60 * 1000;
        expiredAt = timestamp;
      }

      // Execute inserts in a transaction
      const result = await db.transaction(async (tx) => {
        // Insert JSON content using RawJsonModel, but without transaction
        // because Model methods currently don't support transactions in their internal implementation
        const jsonData = {
          jsonContent: data.jsonContent,
          refCount: 1,
        };

        // Create JSON record
        const jsonResult = await RawJsonModel.add(jsonData);
        const jsonId = jsonResult.id;

        // Create user file record
        const userFileData = {
          fileName: data.filename,
          userId: data.userId,
          jsonId,
          shareId,
          isShared: 1,
          expiredAt,
        };

        await UserFileModel.createUserFile(userFileData);

        return { jsonId, shareId };
      });

      return successResult(
        { shareId: result.shareId },
        "File shared successfully"
      );
    } catch (error) {
      console.error("Error creating shared file:", error);
      return errorResult(
        ErrorType.INTERNAL_ERROR,
        "Failed to create shared file"
      );
    }
  }

  /**
   * Get a shared file by its share ID
   * @param shareId The unique ID of the shared file
   * @returns The shared file data or error
   */
  static async getSharedFile(
    shareId: string
  ): Promise<ServiceResult<ShareFileData>> {
    // Find the user file record by shareId
    const userFiles = await UserFileModel.getUserFileByShareId(shareId);
    const userFile = userFiles.length > 0 ? userFiles[0] : null;

    if (!userFile) {
      return errorResult(ErrorType.NOT_FOUND, "Shared file not found");
    }

    // Check if the file has expired
    if (userFile.expiredAt > 0 && userFile.expiredAt < Date.now()) {
      return errorResult(
        ErrorType.FILE_EXPIRED,
        "This shared file has expired"
      );
    }

    // Check if the file is shared
    if (userFile.isShared === 0) {
      return errorResult(ErrorType.FILE_NOT_SHARED, "This file is not shared");
    }

    // Get the JSON content
    const jsonContent = await RawJsonModel.getById(userFile.jsonId);

    if (!jsonContent) {
      return errorResult(ErrorType.NOT_FOUND, "File content not found");
    }

    const fileData: ShareFileData = {
      fileName: userFile.fileName,
      jsonContent: jsonContent.jsonContent,
      shareId: userFile.shareId || "",
      createdAt: userFile.createdAt,
      updatedAt: userFile.updatedAt,
      isExpired: isExpired(userFile.expiredAt),
      isShared: userFile.isShared === 1,
    };

    return successResult(fileData, "File retrieved successfully");
  }

  /**
   * Delete a shared file by its share ID
   * @param shareId The unique ID of the shared file
   * @param userId The ID of the user making the request
   * @returns Object with success status and message
   */
  static async deleteSharedFile(
    shareId: string,
    userId?: string
  ): Promise<ServiceResult> {
    // If userId is provided, verify ownership
    if (userId) {
      const userFiles = await UserFileModel.getUserFileByShareId(shareId);
      const userFile = userFiles.length > 0 ? userFiles[0] : null;

      if (!userFile) {
        return errorResult(ErrorType.NOT_FOUND, "Shared file not found");
      }

      if (userFile.userId !== userId) {
        return errorResult(
          ErrorType.FORBIDDEN,
          "You don't have permission to delete this file"
        );
      }
    }

    // Get the file record
    const userFiles = await UserFileModel.getUserFileByShareId(shareId);
    const userFile = userFiles.length > 0 ? userFiles[0] : null;

    if (!userFile) {
      return errorResult(ErrorType.NOT_FOUND, "Shared file not found");
    }

    try {
      // Execute delete operations within a transaction
      const result = await db.transaction(async (tx) => {
        // Use the model methods that accept transaction parameter
        await UserFileModel.updateSharedStatus(shareId, 0, tx);
        await RawJsonModel.decrementRefCount(userFile.jsonId, tx);

        return { success: true };
      });

      return successResult(null, "File deleted successfully");
    } catch (error) {
      console.error("Error deleting shared file:", error);
      return errorResult(ErrorType.INTERNAL_ERROR, "Delete operation failed");
    }
  }

  /**
   * Check if a shared file is expired
   * @param shareId The unique ID of the shared file
   * @returns Boolean indicating if the file is expired
   */
  static async isExpired(shareId: string): Promise<boolean> {
    const userFiles = await UserFileModel.getUserFileByShareId(shareId);
    const userFile = userFiles.length > 0 ? userFiles[0] : null;

    if (!userFile) {
      return false; // File doesn't exist, so not expired
    }

    return userFile.expiredAt > 0 && userFile.expiredAt < Date.now();
  }

  static async getUserFiles(
    userId: string,
    page: number,
    size: number,
    expiredOnly: boolean,
    sharedOnly: boolean
  ): Promise<ServiceResult<{ data: ShareFileData[]; totalRecords: number }>> {
    try {
      const userFiles = await UserFileModel.getUserFileListByPage(
        userId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );

      // Get total count of records for pagination
      const totalRecords = await UserFileModel.getUserFilesCount(
        userId,
        expiredOnly,
        sharedOnly
      );

      // userFiles convert to ShareFileData[]
      const shareFileData: ShareFileData[] = userFiles.map((userFile) => {
        return {
          fileName: userFile.fileName,
          shareId: userFile.shareId || "",
          createdAt: userFile.createdAt,
          updatedAt: userFile.updatedAt,
          isShared: userFile.isShared === 1,
          isExpired: isExpired(userFile.expiredAt),
        };
      });

      return successResult(
        { data: shareFileData, totalRecords },
        "Shared files retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting shared files:", error);
      return errorResult(
        ErrorType.INTERNAL_ERROR,
        "Failed to get shared files"
      );
    }
  }
}
