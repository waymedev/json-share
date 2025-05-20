import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserFileModel } from "../src/db/userFileModel";
import { SavedService } from "../src/services/savedService";
import { ShareService } from "../src/services/shareService";
import { ErrorType } from "../src/utils/errorHandler";
import { FileData } from "../src/utils/Response";
// 自定义UserFile类型
interface UserFileType {
  id: number;
  fileName: string;
  userId: string;
  jsonId: number;
  shareId: string | null;
  createdAt: string;
  updatedAt: string;
  expiredAt: number;
  isShared: number;
}

// 用于测试的扩展ShareFileData
interface TestShareFileData extends FileData {}

// Mock dependencies
vi.mock("../src/db/userFileModel", () => ({
  UserFileModel: {
    getUserFilesByUserId: vi.fn(),
    createUserFile: vi.fn(),
    deleteUserFile: vi.fn(),
    updateUserFile: vi.fn(),
    getUserFilesCount: vi.fn(),
  },
}));

vi.mock("../src/services/shareService", () => ({
  ShareService: {
    getSharedFile: vi.fn(),
    getUserFiles: vi.fn(),
  },
}));

vi.mock("node:crypto", () => ({
  randomUUID: vi.fn(),
}));

describe("SavedService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(randomUUID).mockReturnValue(
      "00000000-0000-0000-0000-000000000000"
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("saveFile", () => {
    it("should successfully save a file", async () => {
      // Arrange
      const shareId = "share-123";
      const userId = "user-123";
      const fileName = "test-file.json";
      const jsonId = 456;
      const newFileId = 789;

      // Mock ShareService.getSharedFile to return success
      vi.mocked(ShareService.getSharedFile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          fileName: "test-file.json",
          shareId: "original-share-id",
          jsonId: jsonId,
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
          isExpired: false,
          isShared: true,
        },
        message: "File retrieved successfully",
      });

      // Mock UserFileModel.createUserFile to return success
      vi.mocked(UserFileModel.createUserFile).mockResolvedValue({
        id: newFileId,
      });

      // Act
      const result = await SavedService.saveFile(shareId, userId, fileName);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: newFileId });
      expect(ShareService.getSharedFile).toHaveBeenCalledWith(shareId);
      expect(UserFileModel.createUserFile).toHaveBeenCalledWith({
        fileName,
        userId,
        jsonId,
        shareId: "00000000-0000-0000-0000-000000000000",
        isShared: 0,
        expiredAt: 0,
      });
    });

    it("should return error when shared file not found", async () => {
      // Arrange
      const shareId = "invalid-share-id";
      const userId = "user-123";
      const fileName = "test-file.json";

      // Mock ShareService.getSharedFile to return error
      vi.mocked(ShareService.getSharedFile).mockResolvedValue({
        success: false,
        errorType: ErrorType.NOT_FOUND,
        message: "Shared file not found",
      });

      // Act
      const result = await SavedService.saveFile(shareId, userId, fileName);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
      expect(UserFileModel.createUserFile).not.toHaveBeenCalled();
    });

    it("should handle exceptions", async () => {
      // Arrange
      const shareId = "share-123";
      const userId = "user-123";
      const fileName = "test-file.json";

      // Mock ShareService.getSharedFile to throw
      vi.mocked(ShareService.getSharedFile).mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const result = await SavedService.saveFile(shareId, userId, fileName);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
    });
  });

  describe("getSavedFiles", () => {
    it("should successfully retrieve saved files", async () => {
      // Arrange
      const userId = "user-123";
      const page = 1;
      const size = 10;
      const expiredOnly = false;
      const sharedOnly = false;

      const mockFiles: TestShareFileData[] = [
        {
          id: 1,
          fileName: "file1.json",
          shareId: "share-1",
          jsonId: 101,
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
          isExpired: false,
          isShared: false,
        },
        {
          id: 2,
          fileName: "file2.json",
          shareId: "share-2",
          jsonId: 102,
          createdAt: "2023-01-02T00:00:00Z",
          updatedAt: "2023-01-02T00:00:00Z",
          isExpired: false,
          isShared: true,
        },
      ];

      // Mock ShareService.getUserFiles
      vi.mocked(ShareService.getUserFiles).mockResolvedValue({
        success: true,
        data: {
          data: mockFiles,
          totalRecords: 2,
        },
        message: "Files retrieved",
      });

      // Mock UserFileModel.getUserFilesCount
      vi.mocked(UserFileModel.getUserFilesCount).mockResolvedValue(2);

      // Act
      const result = await SavedService.getSavedFiles(
        userId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.data).toEqual(mockFiles);
      expect(result.data?.totalRecords).toBe(2);
      expect(ShareService.getUserFiles).toHaveBeenCalledWith(
        userId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );
    });

    it("should return error when files cannot be retrieved", async () => {
      // Arrange
      const userId = "user-123";
      const page = 1;
      const size = 10;
      const expiredOnly = false;
      const sharedOnly = false;

      // Mock ShareService.getUserFiles to return error
      vi.mocked(ShareService.getUserFiles).mockResolvedValue({
        success: false,
        errorType: ErrorType.NOT_FOUND,
        message: "Error retrieving files",
      });

      // Act
      const result = await SavedService.getSavedFiles(
        userId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
    });

    it("should handle exceptions", async () => {
      // Arrange
      const userId = "user-123";
      const page = 1;
      const size = 10;
      const expiredOnly = false;
      const sharedOnly = false;

      // Mock ShareService.getUserFiles to throw
      vi.mocked(ShareService.getUserFiles).mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const result = await SavedService.getSavedFiles(
        userId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
    });
  });

  describe("removeSavedFile", () => {
    it("should successfully remove a saved file", async () => {
      // Arrange
      const fileId = 123;
      const userId = "user-123";
      const mockFiles: UserFileType[] = [
        {
          id: 123,
          fileName: "file1.json",
          userId: "user-123",
          jsonId: 456,
          shareId: "share-123",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
          expiredAt: 0,
          isShared: 0,
        },
      ];

      // Mock UserFileModel.getUserFilesByUserId
      vi.mocked(UserFileModel.getUserFilesByUserId).mockResolvedValue(
        mockFiles
      );

      // Mock UserFileModel.deleteUserFile
      vi.mocked(UserFileModel.deleteUserFile).mockResolvedValue(undefined);

      // Act
      const result = await SavedService.removeSavedFile(fileId, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.getUserFilesByUserId).toHaveBeenCalledWith(userId);
      expect(UserFileModel.deleteUserFile).toHaveBeenCalledWith(fileId);
    });

    it("should return error when file not found", async () => {
      // Arrange
      const fileId = 999;
      const userId = "user-123";
      const mockFiles: UserFileType[] = [
        {
          id: 123,
          fileName: "file1.json",
          userId: "user-123",
          jsonId: 456,
          shareId: "share-123",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
          expiredAt: 0,
          isShared: 0,
        },
      ];

      // Mock UserFileModel.getUserFilesByUserId
      vi.mocked(UserFileModel.getUserFilesByUserId).mockResolvedValue(
        mockFiles
      );

      // Act
      const result = await SavedService.removeSavedFile(fileId, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
      expect(UserFileModel.deleteUserFile).not.toHaveBeenCalled();
    });

    it("should handle exceptions", async () => {
      // Arrange
      const fileId = 123;
      const userId = "user-123";

      // Mock UserFileModel.getUserFilesByUserId to throw
      vi.mocked(UserFileModel.getUserFilesByUserId).mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const result = await SavedService.removeSavedFile(fileId, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
    });
  });

  describe("updateSavedFile", () => {
    it("should successfully update a saved file with all fields", async () => {
      // Arrange
      const fileId = 123;
      const userId = "user-123";
      const updateData = {
        fileName: "updated-file.json",
        isShared: true,
        expirationDays: 7,
      };

      const mockFile: UserFileType = {
        id: 123,
        fileName: "original-file.json",
        userId: "user-123",
        jsonId: 456,
        shareId: "share-123",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        isShared: 0,
        expiredAt: 0,
      };

      // Mock UserFileModel.getUserFilesByUserId
      vi.mocked(UserFileModel.getUserFilesByUserId).mockResolvedValue([
        mockFile,
      ]);

      // Mock UserFileModel.updateUserFile
      vi.mocked(UserFileModel.updateUserFile).mockResolvedValue({ id: fileId });

      // Mock Date.now for consistent testing
      const originalDateNow = Date.now;
      Date.now = vi.fn().mockReturnValue(1600000000000); // Mock timestamp

      // Act
      const result = await SavedService.updateSavedFile(
        fileId,
        userId,
        updateData
      );

      // Restore Date.now
      Date.now = originalDateNow;

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.getUserFilesByUserId).toHaveBeenCalledWith(userId);
      expect(UserFileModel.updateUserFile).toHaveBeenCalledWith(fileId, {
        ...mockFile,
        fileName: updateData.fileName,
        isShared: 1,
        expiredAt:
          1600000000000 + updateData.expirationDays * 24 * 60 * 60 * 1000,
      });
    });

    it("should update only specified fields", async () => {
      // Arrange
      const fileId = 123;
      const userId = "user-123";
      const updateData = {
        fileName: "updated-file.json",
        // No isShared or expirationDays
      };

      const mockFile: UserFileType = {
        id: 123,
        fileName: "original-file.json",
        userId: "user-123",
        jsonId: 456,
        shareId: "share-123",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        isShared: 0,
        expiredAt: 0,
      };

      // Mock UserFileModel.getUserFilesByUserId
      vi.mocked(UserFileModel.getUserFilesByUserId).mockResolvedValue([
        mockFile,
      ]);

      // Mock UserFileModel.updateUserFile
      vi.mocked(UserFileModel.updateUserFile).mockResolvedValue({ id: fileId });

      // Act
      const result = await SavedService.updateSavedFile(
        fileId,
        userId,
        updateData
      );

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.updateUserFile).toHaveBeenCalledWith(fileId, {
        ...mockFile,
        fileName: updateData.fileName,
        isShared: mockFile.isShared, // Unchanged
        expiredAt: mockFile.expiredAt, // Unchanged
      });
    });

    it("should return error when file not found", async () => {
      // Arrange
      const fileId = 999;
      const userId = "user-123";
      const updateData = {
        fileName: "updated-file.json",
      };

      // Mock UserFileModel.getUserFilesByUserId with empty array
      vi.mocked(UserFileModel.getUserFilesByUserId).mockResolvedValue([]);

      // Act
      const result = await SavedService.updateSavedFile(
        fileId,
        userId,
        updateData
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
      expect(UserFileModel.updateUserFile).not.toHaveBeenCalled();
    });

    it("should handle exceptions", async () => {
      // Arrange
      const fileId = 123;
      const userId = "user-123";
      const updateData = {
        fileName: "updated-file.json",
      };

      // Mock UserFileModel.getUserFilesByUserId to throw
      vi.mocked(UserFileModel.getUserFilesByUserId).mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const result = await SavedService.updateSavedFile(
        fileId,
        userId,
        updateData
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
    });
  });
});
