import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  // Common test data
  const mockShareId = "share-123";
  const mockUserId = "user-123";
  const mockFileName = "test-file.json";
  const mockJsonId = 456;
  const mockNewFileId = 789;
  const mockUUID = "00000000-0000-0000-0000-000000000000";

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Setup default mocks
    vi.mocked(randomUUID).mockReturnValue(mockUUID);
  });

  describe("saveFile", () => {
    it("should generate a new UUID and create a user file when saving a shared file", async () => {
      // Arrange
      const mockSharedFileData = {
        id: 1,
        file_name: mockFileName,
        share_id: "original-share-id",
        json_id: mockJsonId,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        is_expired: false,
        is_shared: true,
      };

      vi.mocked(ShareService.getSharedFile).mockResolvedValue({
        success: true,
        data: mockSharedFileData,
        message: "File retrieved successfully",
      });

      vi.mocked(UserFileModel.createUserFile).mockResolvedValue({
        id: mockNewFileId,
      });

      // Act
      const result = await SavedService.saveFile(
        mockShareId,
        mockUserId,
        mockFileName
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: mockNewFileId });
      expect(ShareService.getSharedFile).toHaveBeenCalledWith(mockShareId);
      expect(UserFileModel.createUserFile).toHaveBeenCalledWith({
        fileName: mockFileName,
        userId: mockUserId,
        jsonId: mockJsonId,
        shareId: mockUUID,
        isShared: 0,
        expiredAt: 0,
      });
    });

    it("should return error with proper type when shared file not found", async () => {
      // Arrange
      vi.mocked(ShareService.getSharedFile).mockResolvedValue({
        success: false,
        errorType: ErrorType.NOT_FOUND,
        message: "Shared file not found",
      });

      // Act
      const result = await SavedService.saveFile(
        mockShareId,
        mockUserId,
        mockFileName
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
      expect(UserFileModel.createUserFile).not.toHaveBeenCalled();
    });

    it("should return INTERNAL_ERROR when an exception occurs during saving", async () => {
      // Arrange
      vi.mocked(ShareService.getSharedFile).mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const result = await SavedService.saveFile(
        mockShareId,
        mockUserId,
        mockFileName
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
      expect(result.message).toContain("Failed to save file");
    });
  });

  describe("getSavedFiles", () => {
    it("should retrieve saved files with pagination and correct total count", async () => {
      // Arrange
      const page = 1;
      const size = 10;
      const expiredOnly = false;
      const sharedOnly = false;

      const mockFiles: FileData[] = [
        {
          id: 1,
          file_name: "file1.json",
          share_id: "share-1",
          json_id: 101,
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
          is_expired: false,
          is_shared: false,
        },
        {
          id: 2,
          file_name: "file2.json",
          share_id: "share-2",
          json_id: 102,
          created_at: "2023-01-02T00:00:00Z",
          updated_at: "2023-01-02T00:00:00Z",
          is_expired: false,
          is_shared: true,
        },
      ];

      vi.mocked(ShareService.getUserFiles).mockResolvedValue({
        success: true,
        data: {
          data: mockFiles,
          totalRecords: 2,
        },
        message: "Files retrieved",
      });

      vi.mocked(UserFileModel.getUserFilesCount).mockResolvedValue(2);

      // Act
      const result = await SavedService.getSavedFiles(
        mockUserId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.totalRecords).toBe(2);
      expect(result.data?.data).toHaveLength(2);
      expect(ShareService.getUserFiles).toHaveBeenCalledWith(
        mockUserId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );
      expect(UserFileModel.getUserFilesCount).toHaveBeenCalledWith(
        mockUserId,
        expiredOnly,
        sharedOnly
      );
    });

    it("should return error when failed to retrieve files", async () => {
      // Arrange
      const page = 1;
      const size = 10;
      const expiredOnly = false;
      const sharedOnly = false;

      vi.mocked(ShareService.getUserFiles).mockResolvedValue({
        success: false,
        errorType: ErrorType.INTERNAL_ERROR,
        message: "Database error",
      });

      // Act
      const result = await SavedService.getSavedFiles(
        mockUserId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
      expect(UserFileModel.getUserFilesCount).not.toHaveBeenCalled();
    });

    it("should handle exceptions when retrieving saved files", async () => {
      // Arrange
      const page = 1;
      const size = 10;
      const expiredOnly = false;
      const sharedOnly = false;

      vi.mocked(ShareService.getUserFiles).mockRejectedValue(
        new Error("Unexpected error")
      );

      // Act
      const result = await SavedService.getSavedFiles(
        mockUserId,
        page,
        size,
        expiredOnly,
        sharedOnly
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
      expect(result.message).toContain("Failed to get saved files");
      expect(UserFileModel.getUserFilesCount).not.toHaveBeenCalled();
    });
  });

  describe("deleteSavedFile", () => {
    it("should successfully delete a saved file by ID", async () => {
      // Arrange
      const fileId = 123;
      const mockFiles = [
        {
          id: fileId,
          fileName: "test-file.json",
          userId: mockUserId,
          jsonId: 456,
          shareId: "share-123",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
          expiredAt: 0,
          isShared: 0,
        },
      ];

      vi.mocked(UserFileModel.getUserFilesByUserId).mockResolvedValue(
        mockFiles
      );
      vi.mocked(UserFileModel.deleteUserFile).mockResolvedValue(undefined);

      // Act
      const result = await SavedService.removeSavedFile(fileId, mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.getUserFilesByUserId).toHaveBeenCalledWith(
        mockUserId
      );
      expect(UserFileModel.deleteUserFile).toHaveBeenCalledWith(fileId);
    });

    it("should return error when file not found", async () => {
      // Arrange
      const fileId = 123;

      vi.mocked(UserFileModel.getUserFilesByUserId).mockResolvedValue([]);

      // Act
      const result = await SavedService.removeSavedFile(fileId, mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
    });

    it("should handle exceptions during file deletion", async () => {
      // Arrange
      const fileId = 123;

      vi.mocked(UserFileModel.getUserFilesByUserId).mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const result = await SavedService.removeSavedFile(fileId, mockUserId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
      expect(result.message).toContain("Failed to remove saved file");
    });
  });

  describe("updateSavedFile", () => {
    it("should successfully update a saved file's name", async () => {
      // Arrange
      const fileId = 123;
      const updateData = {
        file_name: "updated-file.json",
      };
      const mockFile = {
        id: fileId,
        fileName: "original-file.json",
        userId: mockUserId,
        jsonId: 456,
        shareId: "share-123",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        expiredAt: 0,
        isShared: 0,
      };

      vi.mocked(UserFileModel.getUserFilesByUserId).mockResolvedValue([
        mockFile,
      ]);
      vi.mocked(UserFileModel.updateUserFile).mockResolvedValue({ id: fileId });

      // Act
      const result = await SavedService.updateSavedFile(
        fileId,
        mockUserId,
        updateData
      );

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.getUserFilesByUserId).toHaveBeenCalledWith(
        mockUserId
      );
      expect(UserFileModel.updateUserFile).toHaveBeenCalledWith(fileId, {
        ...mockFile,
        fileName: updateData.file_name,
      });
    });

    it("should return error when file not found", async () => {
      // Arrange
      const fileId = 123;
      const updateData = {
        file_name: "updated-file.json",
      };

      vi.mocked(UserFileModel.getUserFilesByUserId).mockResolvedValue([]);

      // Act
      const result = await SavedService.updateSavedFile(
        fileId,
        mockUserId,
        updateData
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
    });

    it("should handle exceptions during file update", async () => {
      // Arrange
      const fileId = 123;
      const updateData = {
        file_name: "updated-file.json",
      };

      vi.mocked(UserFileModel.getUserFilesByUserId).mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const result = await SavedService.updateSavedFile(
        fileId,
        mockUserId,
        updateData
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
      expect(result.message).toContain("Failed to update saved file");
    });
  });
});
