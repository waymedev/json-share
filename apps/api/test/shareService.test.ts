import { randomUUID } from "crypto";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { db } from "../src/db";
import { RawJsonModel } from "../src/db/rawJsonModel";
import { UserFileModel } from "../src/db/userFileModel";
import { ShareService } from "../src/services/shareService";

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

  beforeAll(() => {
    // Setup mocks
    vi.mocked(randomUUID).mockReturnValue(mockShareId);
    vi.mocked(UserFileModel.createUserFile).mockResolvedValue({ id: 1 });
    vi.mocked(RawJsonModel.add).mockResolvedValue({ id: mockJsonId });
    vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValue([
      mockUserFile,
    ]);
    vi.mocked(RawJsonModel.getById).mockResolvedValue(mockJsonContent2);
    vi.mocked(UserFileModel.updateSharedStatus).mockResolvedValue({
      success: true,
    });
    vi.mocked(RawJsonModel.decrementRefCount).mockResolvedValue({
      success: true,
    });
    vi.mocked(UserFileModel.getUserFileListByPage).mockResolvedValue([
      mockUserFile,
    ]);
    vi.mocked(UserFileModel.getUserFilesCount).mockResolvedValue(1);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe("createSharedFile", () => {
    test("should create a shared file successfully without expiration", async () => {
      const fileData = {
        filename: mockFileName,
        jsonContent: mockJsonContent,
        userId: mockUserId,
      };

      const result = await ShareService.createSharedFile(fileData);

      expect(result.success).toBe(true);
      expect(result.data?.shareId).toBe(mockShareId);
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

    test("should create a shared file with expiration successfully", async () => {
      const fileData = {
        filename: mockFileName,
        jsonContent: mockJsonContent,
        userId: mockUserId,
        expirationDays: 7,
      };

      // Mock Date.now() to return a fixed timestamp
      const mockTimestamp = 1625097600000; // Just an example timestamp
      const realDateNow = Date.now;
      Date.now = vi.fn().mockReturnValue(mockTimestamp);

      const result = await ShareService.createSharedFile(fileData);

      expect(result.success).toBe(true);
      expect(result.data?.shareId).toBe(mockShareId);
      expect(UserFileModel.createUserFile).toHaveBeenCalledWith({
        fileName: mockFileName,
        userId: mockUserId,
        jsonId: mockJsonId,
        shareId: mockShareId,
        isShared: 1,
        expiredAt: mockTimestamp + 7 * 24 * 60 * 60 * 1000,
      });

      // Restore original Date.now
      Date.now = realDateNow;
    });

    test("should handle errors when creating a shared file", async () => {
      vi.mocked(RawJsonModel.add).mockRejectedValueOnce(
        new Error("Database error")
      );

      const fileData = {
        filename: mockFileName,
        jsonContent: mockJsonContent,
        userId: mockUserId,
      };

      const result = await ShareService.createSharedFile(fileData);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("INTERNAL_ERROR");
    });
  });

  describe("getSharedFile", () => {
    test("should get a shared file successfully", async () => {
      const result = await ShareService.getSharedFile(mockShareId);

      expect(result.success).toBe(true);
      expect(result.data?.fileName).toBe(mockFileName);
      expect(result.data?.jsonContent).toEqual(mockJsonContent);
      expect(result.data?.shareId).toBe(mockShareId);
      expect(UserFileModel.getUserFileByShareId).toHaveBeenCalledWith(
        mockShareId
      );
      expect(RawJsonModel.getById).toHaveBeenCalledWith(mockJsonId);
    });

    test("should return error when shared file is not found", async () => {
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValueOnce([]);

      const result = await ShareService.getSharedFile(mockShareId);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("NOT_FOUND");
    });

    test("should return error when file is expired", async () => {
      const expiredFile = {
        ...mockUserFile,
        expiredAt: Date.now() - 1000, // Already expired
      };
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValueOnce([
        expiredFile,
      ]);

      const result = await ShareService.getSharedFile(mockShareId);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("FILE_EXPIRED");
    });

    test("should return error when file is not shared", async () => {
      const notSharedFile = {
        ...mockUserFile,
        isShared: 0,
      };
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValueOnce([
        notSharedFile,
      ]);

      const result = await ShareService.getSharedFile(mockShareId);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("FILE_NOT_SHARED");
    });

    test("should return error when file content is not found", async () => {
      vi.mocked(RawJsonModel.getById).mockResolvedValueOnce(null as any);

      const result = await ShareService.getSharedFile(mockShareId);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("NOT_FOUND");
    });
  });

  describe("deleteSharedFile", () => {
    test("should delete a shared file successfully when user is the owner", async () => {
      const result = await ShareService.deleteSharedFile(
        mockShareId,
        mockUserId
      );

      expect(result.success).toBe(true);
      expect(UserFileModel.getUserFileByShareId).toHaveBeenCalledWith(
        mockShareId
      );
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

    test("should delete a shared file successfully when no user ID is provided", async () => {
      const result = await ShareService.deleteSharedFile(mockShareId);

      expect(result.success).toBe(true);
      expect(UserFileModel.getUserFileByShareId).toHaveBeenCalledWith(
        mockShareId
      );
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

    test("should return error when shared file is not found", async () => {
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValueOnce([]);

      const result = await ShareService.deleteSharedFile(
        mockShareId,
        mockUserId
      );

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("NOT_FOUND");
    });

    test("should return error when user is not the owner", async () => {
      const differentUserId = "different-user";

      const result = await ShareService.deleteSharedFile(
        mockShareId,
        differentUserId
      );

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("FORBIDDEN");
    });

    test("should handle errors during deletion", async () => {
      vi.mocked(db.transaction).mockRejectedValueOnce(
        new Error("Transaction error")
      );

      const result = await ShareService.deleteSharedFile(
        mockShareId,
        mockUserId
      );

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("INTERNAL_ERROR");
    });
  });

  describe("isExpired", () => {
    test("should return true for expired files", async () => {
      const expiredFile = {
        ...mockUserFile,
        expiredAt: Date.now() - 1000, // Already expired
      };
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValueOnce([
        expiredFile,
      ]);

      const result = await ShareService.isExpired(mockShareId);

      expect(result).toBe(true);
    });

    test("should return false for non-expired files", async () => {
      const nonExpiredFile = {
        ...mockUserFile,
        expiredAt: Date.now() + 1000, // Not expired yet
      };
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValueOnce([
        nonExpiredFile,
      ]);

      const result = await ShareService.isExpired(mockShareId);

      expect(result).toBe(false);
    });

    test("should return false for files without expiration", async () => {
      const noExpirationFile = {
        ...mockUserFile,
        expiredAt: 0, // No expiration
      };
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValueOnce([
        noExpirationFile,
      ]);

      const result = await ShareService.isExpired(mockShareId);

      expect(result).toBe(false);
    });

    test("should return false when file is not found", async () => {
      vi.mocked(UserFileModel.getUserFileByShareId).mockResolvedValueOnce([]);

      const result = await ShareService.isExpired(mockShareId);

      expect(result).toBe(false);
    });
  });

  describe("getUserFiles", () => {
    test("should get user files successfully", async () => {
      const result = await ShareService.getUserFiles(
        mockUserId,
        1,
        10,
        false,
        false
      );

      expect(result.success).toBe(true);
      expect(result.data?.data.length).toBe(1);
      expect(result.data?.totalRecords).toBe(1);
      expect(UserFileModel.getUserFileListByPage).toHaveBeenCalledWith(
        mockUserId,
        1,
        10,
        false,
        false
      );
      expect(UserFileModel.getUserFilesCount).toHaveBeenCalledWith(
        mockUserId,
        false,
        false
      );
    });

    test("should get expired files only when expiredOnly is true", async () => {
      await ShareService.getUserFiles(mockUserId, 1, 10, true, false);

      expect(UserFileModel.getUserFileListByPage).toHaveBeenCalledWith(
        mockUserId,
        1,
        10,
        true,
        false
      );
      expect(UserFileModel.getUserFilesCount).toHaveBeenCalledWith(
        mockUserId,
        true,
        false
      );
    });

    test("should get shared files only when sharedOnly is true", async () => {
      await ShareService.getUserFiles(mockUserId, 1, 10, false, true);

      expect(UserFileModel.getUserFileListByPage).toHaveBeenCalledWith(
        mockUserId,
        1,
        10,
        false,
        true
      );
      expect(UserFileModel.getUserFilesCount).toHaveBeenCalledWith(
        mockUserId,
        false,
        true
      );
    });

    test("should handle errors when getting user files", async () => {
      vi.mocked(UserFileModel.getUserFileListByPage).mockRejectedValueOnce(
        new Error("Database error")
      );

      const result = await ShareService.getUserFiles(
        mockUserId,
        1,
        10,
        false,
        false
      );

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("INTERNAL_ERROR");
    });
  });
});
