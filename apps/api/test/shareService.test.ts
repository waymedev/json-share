import { randomUUID } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RawJsonModel } from "../src/db/rawJsonModel";
import { UserFileModel } from "../src/db/userFileModel";
import { ShareService } from "../src/services/shareService";
import { ErrorType } from "../src/utils/errorHandler";
import { FileData } from "../src/utils/Response";

// Mock interface to map between snake_case API response and camelCase test data
// This helps us avoid changing all test code while still working with the updated snake_case API
vi.mock("../src/utils/Response", () => {
  return {
    FileData: Object,
    successResponse: vi.fn(),
    errorResponse: vi.fn(),
  };
});

// Extension of FileData that maps camelCase properties to snake_case
class TestFileData implements FileData {
  id: number;
  file_name: string;
  share_id: string;
  json_id: number;
  json_content?: any;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
  is_shared: boolean;

  constructor(data: any) {
    this.id = data.id;
    this.file_name = data.fileName;
    this.share_id = data.shareId;
    this.json_id = data.jsonId;
    this.json_content = data.jsonContent;
    this.created_at = data.createdAt;
    this.updated_at = data.updatedAt;
    this.is_expired = data.isExpired;
    this.is_shared = data.isShared === 1;
  }
}

// Mock the database transaction
vi.mock("../src/db", () => {
  return {
    db: {
      transaction: vi.fn(async (callback) => {
        return await callback({
          update: vi.fn(),
          insert: vi.fn(),
          delete: vi.fn(),
        });
      }),
    },
  };
});

// Mock the models
vi.mock("../src/db/userFileModel", () => {
  return {
    UserFileModel: {
      createUserFile: vi.fn(),
      getUserFileByShareId: vi.fn(),
      updateSharedStatus: vi.fn(),
      getUserFileListByPage: vi.fn(),
      getUserFilesCount: vi.fn(),
    },
  };
});

vi.mock("../src/db/rawJsonModel", () => {
  return {
    RawJsonModel: {
      add: vi.fn(),
      getById: vi.fn(),
      decrementRefCount: vi.fn(),
    },
  };
});

// Mock crypto
vi.mock("crypto", () => {
  return {
    randomUUID: vi.fn(),
  };
});

describe("ShareService", () => {
  // Test fixtures
  const mockUserId = "test-user-123";
  const mockFileName = "test-file.json";
  const mockJsonContent = { test: "data" };
  const mockShareId = "12345678-1234-1234-1234-123456789abc";
  const mockJsonId = 123;
  const mockUserFile = {
    id: 1,
    fileName: mockFileName,
    userId: mockUserId,
    jsonId: mockJsonId,
    shareId: mockShareId,
    isShared: 1,
    expiredAt: 0,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  };
  const mockJsonContent2 = {
    id: mockJsonId,
    jsonContent: mockJsonContent,
    refCount: 1,
  };

  beforeEach(() => {
    // Reset all mocks before each test to ensure isolation
    vi.resetAllMocks();

    // Setup common mocks
    vi.mocked(randomUUID).mockReturnValue(mockShareId);
  });

  describe("createSharedFile", () => {
    it("should create a file with a unique shareId and default expiration", async () => {
      // Arrange
      const fileData = {
        filename: mockFileName,
        json_content: mockJsonContent,
        user_id: mockUserId,
      };
      vi.mocked(RawJsonModel.add).mockResolvedValue({ id: mockJsonId });
      vi.mocked(UserFileModel.createUserFile).mockResolvedValue({ id: 1 });

      // Act
      const result = await ShareService.createSharedFile(fileData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.share_id).toBe(mockShareId);
      expect(RawJsonModel.add).toHaveBeenCalledWith({
        jsonContent: mockJsonContent,
        refCount: 1,
      });
      expect(UserFileModel.createUserFile).toHaveBeenCalledWith({
        fileName: mockFileName,
        userId: mockUserId,
        jsonId: mockJsonId,
        shareId: mockShareId,
        isShared: 1,
        expiredAt: 0,
      });
    });

    it("should calculate expiration date correctly when expiration days provided", async () => {
      // Arrange
      const fileData = {
        filename: mockFileName,
        json_content: mockJsonContent,
        user_id: mockUserId,
        expiration_days: 7,
      };
      const mockTimestamp = 1625097600000;
      const realDateNow = Date.now;
      Date.now = vi.fn().mockReturnValue(mockTimestamp);
      vi.mocked(RawJsonModel.add).mockResolvedValue({ id: mockJsonId });
      vi.mocked(UserFileModel.createUserFile).mockResolvedValue({ id: 1 });

      // Act
      const result = await ShareService.createSharedFile(fileData);

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.createUserFile).toHaveBeenCalledWith({
        fileName: mockFileName,
        userId: mockUserId,
        jsonId: mockJsonId,
        shareId: mockShareId,
        isShared: 1,
        expiredAt: mockTimestamp + 7 * 24 * 60 * 60 * 1000,
      });

      // Cleanup
      Date.now = realDateNow;
    });

    it("should handle database errors when creating JSON content", async () => {
      // Arrange
      const fileData = {
        filename: mockFileName,
        json_content: mockJsonContent,
        user_id: mockUserId,
      };
      const mockError = new Error("Database error");
      vi.mocked(RawJsonModel.add).mockRejectedValueOnce(mockError);

      // Act
      const result = await ShareService.createSharedFile(fileData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
    });

    it("should handle database errors when creating user file", async () => {
      // Arrange
      const fileData = {
        filename: mockFileName,
        json_content: mockJsonContent,
        user_id: mockUserId,
      };
      vi.mocked(RawJsonModel.add).mockResolvedValue({ id: mockJsonId });
      const mockError = new Error("Database error");
      vi.mocked(UserFileModel.createUserFile).mockRejectedValueOnce(mockError);

      // Act
      const result = await ShareService.createSharedFile(fileData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
    });
  });

  describe("getSharedFile", () => {
    it("should retrieve a shared file by shareId when it exists", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        mockUserFile,
      ]);
      vi.mocked(RawJsonModel.getById).mockResolvedValue(mockJsonContent2);

      // Act
      const result = await ShareService.getSharedFile(mockShareId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(UserFileModel.getUserFileByShareId).toHaveBeenCalledWith(
        mockShareId
      );
      expect(RawJsonModel.getById).toHaveBeenCalledWith(mockJsonId);
    });

    it("should return error when file not found by shareId", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([]);

      // Act
      const result = await ShareService.getSharedFile(mockShareId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
    });

    it("should return error when file is expired", async () => {
      // Arrange
      const expiredFile = {
        ...mockUserFile,
        expiredAt: Date.now() - 1000, // expired timestamp
      };
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        expiredFile,
      ]);

      // Act
      const result = await ShareService.getSharedFile(mockShareId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.FILE_EXPIRED);
    });

    it("should return error when file is not shared", async () => {
      // Arrange
      const unsharedFile = {
        ...mockUserFile,
        isShared: 0,
      };
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        unsharedFile,
      ]);

      // Act
      const result = await ShareService.getSharedFile(mockShareId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.FILE_NOT_SHARED);
    });

    it("should return error when json content not found", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        mockUserFile,
      ]);
      vi.mocked(RawJsonModel.getById).mockResolvedValue(null as any);

      // Act
      const result = await ShareService.getSharedFile(mockShareId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
    });
  });

  describe("deleteSharedFile", () => {
    it("should delete shared file when user is the owner", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        mockUserFile,
      ]);
      vi.mocked(UserFileModel.updateSharedStatus).mockResolvedValue({
        success: true,
      });
      vi.mocked(RawJsonModel.decrementRefCount).mockResolvedValue({
        success: true,
      });

      // Act
      const result = await ShareService.deleteSharedFile(
        mockShareId,
        mockUserId
      );

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.updateSharedStatus).toHaveBeenCalledWith(
        mockShareId,
        0,
        expect.anything()
      );
      expect(RawJsonModel.decrementRefCount).toHaveBeenCalledWith(
        mockJsonId,
        expect.anything()
      );
    });

    it("should delete shared file when no user ID is provided", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        mockUserFile,
      ]);
      vi.mocked(UserFileModel.updateSharedStatus).mockResolvedValue({
        success: true,
      });
      vi.mocked(RawJsonModel.decrementRefCount).mockResolvedValue({
        success: true,
      });

      // Act
      const result = await ShareService.deleteSharedFile(mockShareId);

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.updateSharedStatus).toHaveBeenCalledWith(
        mockShareId,
        0,
        expect.anything()
      );
      expect(RawJsonModel.decrementRefCount).toHaveBeenCalledWith(
        mockJsonId,
        expect.anything()
      );
    });

    it("should return error when file not found", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([]);

      // Act
      const result = await ShareService.deleteSharedFile(
        mockShareId,
        mockUserId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.NOT_FOUND);
    });

    it("should return error when user is not the owner", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        mockUserFile,
      ]);
      const differentUserId = "different-user-456";

      // Act
      const result = await ShareService.deleteSharedFile(
        mockShareId,
        differentUserId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.FORBIDDEN);
    });

    it("should handle errors during transaction", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        mockUserFile,
      ]);
      vi.mocked(UserFileModel.updateSharedStatus).mockRejectedValueOnce(
        new Error("Update error")
      );

      // Act
      const result = await ShareService.deleteSharedFile(
        mockShareId,
        mockUserId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
    });
  });

  describe("isExpired", () => {
    it("should return true for expired files", async () => {
      // Arrange
      const expiredFile = {
        ...mockUserFile,
        expiredAt: Date.now() - 1000, // past timestamp
      };
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        expiredFile,
      ]);

      // Act
      const result = await ShareService.isExpired(mockShareId);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false for non-expired files", async () => {
      // Arrange
      const futureExpiredFile = {
        ...mockUserFile,
        expiredAt: Date.now() + 1000000, // future timestamp
      };
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        futureExpiredFile,
      ]);

      // Act
      const result = await ShareService.isExpired(mockShareId);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false for files without expiration", async () => {
      // Arrange - mockUserFile already has expiredAt: 0
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
        mockUserFile,
      ]);

      // Act
      const result = await ShareService.isExpired(mockShareId);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when file is not found", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([]);

      // Act
      const result = await ShareService.isExpired(mockShareId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getUserFiles", () => {
    it("should get user files with pagination", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileListByPage).mockResolvedValue([
        mockUserFile,
      ]);
      vi.mocked(UserFileModel.getUserFilesCount).mockResolvedValue(1);

      // Act
      const result = await ShareService.getUserFiles(
        mockUserId,
        1,
        10,
        false,
        false
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.totalRecords).toBe(1);
      expect(result.data?.data).toHaveLength(1);
      expect(UserFileModel.getUserFileListByPage).toHaveBeenCalledWith(
        mockUserId,
        1,
        10,
        false,
        false
      );
    });

    it("should filter expired files when expiredOnly is true", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileListByPage).mockResolvedValue([
        mockUserFile,
      ]);
      vi.mocked(UserFileModel.getUserFilesCount).mockResolvedValue(1);

      // Act
      const result = await ShareService.getUserFiles(
        mockUserId,
        1,
        10,
        true,
        false
      );

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.getUserFileListByPage).toHaveBeenCalledWith(
        mockUserId,
        1,
        10,
        true,
        false
      );
    });

    it("should filter shared files when sharedOnly is true", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileListByPage).mockResolvedValue([
        mockUserFile,
      ]);
      vi.mocked(UserFileModel.getUserFilesCount).mockResolvedValue(1);

      // Act
      const result = await ShareService.getUserFiles(
        mockUserId,
        1,
        10,
        false,
        true
      );

      // Assert
      expect(result.success).toBe(true);
      expect(UserFileModel.getUserFileListByPage).toHaveBeenCalledWith(
        mockUserId,
        1,
        10,
        false,
        true
      );
    });

    it("should handle errors when getting user files", async () => {
      // Arrange
      vi.mocked(UserFileModel.getUserFileListByPage).mockRejectedValueOnce(
        new Error("Database error")
      );

      // Act
      const result = await ShareService.getUserFiles(
        mockUserId,
        1,
        10,
        false,
        false
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorType.INTERNAL_ERROR);
    });
  });
});
