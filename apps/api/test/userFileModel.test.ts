import { randomUUID } from "crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { RawJsonModel } from "../src/db/rawJsonModel";
import { UserFileModel } from "../src/db/userFileModel";

interface JsonResult {
  id: number;
}

describe("UserFileModel", () => {
  // Test fixtures
  let testJsonId: number;
  let testUserFileId: number;
  const testUserId = "test-user-123";
  const testFileName = "test-file.json";
  const expireTime = Date.now() + 86400000; // 24 hours from now
  const testJsonContent = { test: "user file data" };
  const testShareId = randomUUID();

  // Setup test data
  beforeAll(async () => {
    // Create a JSON entry first to reference in user files
    const jsonResult = (await RawJsonModel.add({
      jsonContent: testJsonContent,
      refCount: 1,
    })) as JsonResult;
    testJsonId = jsonResult.id;
  });

  // Cleanup after all tests
  afterAll(async () => {
    try {
      // Try to delete the user file if it wasn't already deleted in tests
      await UserFileModel.deleteUserFile(testUserFileId);
    } catch (error) {
      // Ignore if already deleted
    }

    try {
      // Delete the JSON document we created
      await RawJsonModel.delete(testJsonId);
    } catch (error) {
      // Ignore if already deleted
    }
  });

  describe("createUserFile", () => {
    it("should create a user file record and return its ID", async () => {
      // Arrange
      const userFile = {
        fileName: testFileName,
        userId: testUserId,
        jsonId: testJsonId,
        expiredAt: expireTime,
        isShared: 0,
        shareId: testShareId,
      };

      // Act
      const result = await UserFileModel.createUserFile(userFile);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.id).toBe("number");
      testUserFileId = result.id;
    });
  });

  describe("getUserFilesByUserId", () => {
    it("should retrieve all files for a given user ID", async () => {
      // Act
      const userFiles = await UserFileModel.getUserFilesByUserId(testUserId);

      // Assert
      expect(userFiles).toBeDefined();
      expect(userFiles.length).toBeGreaterThan(0);

      const fileFound = userFiles.find((file) => file.id === testUserFileId);
      expect(fileFound).toBeDefined();
      expect(fileFound?.fileName).toBe(testFileName);
      expect(fileFound?.jsonId).toBe(testJsonId);
    });
  });

  describe("getUserFileByShareId", () => {
    it("should retrieve files by share ID", async () => {
      // Act
      const userFiles = await UserFileModel.getUserFileByShareId(testShareId);

      // Assert
      expect(userFiles).toBeDefined();
      expect(userFiles.length).toBe(1);
      expect(userFiles[0].id).toBe(testUserFileId);
      expect(userFiles[0].fileName).toBe(testFileName);
      expect(userFiles[0].userId).toBe(testUserId);
      expect(userFiles[0].shareId).toBe(testShareId);
    });
  });

  describe("getUserFileListByPage", () => {
    it("should retrieve files with pagination", async () => {
      // Arrange
      const page = 1;
      const pageSize = 10;

      // Act
      const userFiles = await UserFileModel.getUserFileListByPage(
        testUserId,
        page,
        pageSize,
        false,
        false
      );

      // Assert
      expect(userFiles).toBeDefined();
      expect(Array.isArray(userFiles)).toBe(true);
      expect(userFiles.length).toBeGreaterThan(0);

      // Find our test file in the results
      const fileFound = userFiles.find((file) => file.id === testUserFileId);
      expect(fileFound).toBeDefined();
    });

    it("should filter shared files when sharedOnly is true", async () => {
      // Arrange
      const page = 1;
      const pageSize = 10;

      // First update our file to be shared
      await UserFileModel.updateSharedStatus(testShareId, 1);

      // Act
      const userFiles = await UserFileModel.getUserFileListByPage(
        testUserId,
        page,
        pageSize,
        false,
        true
      );

      // Assert
      const fileFound = userFiles.find((file) => file.id === testUserFileId);
      expect(fileFound).toBeDefined();
      expect(fileFound?.isShared).toBe(1);
    });
  });

  describe("getUserFilesCount", () => {
    it("should count user files with optional filters", async () => {
      // Act
      const allFilesCount = await UserFileModel.getUserFilesCount(
        testUserId,
        false,
        false
      );

      // Assert
      expect(allFilesCount).toBeGreaterThan(0);

      // Act - now count shared files
      const sharedFilesCount = await UserFileModel.getUserFilesCount(
        testUserId,
        false,
        true
      );

      // Assert
      expect(sharedFilesCount).toBeGreaterThan(0);
    });
  });

  describe("updateSharedStatus", () => {
    it("should update the shared status of a file", async () => {
      // Arrange - Set file as not shared
      await UserFileModel.updateSharedStatus(testShareId, 0);

      // Act - Verify the update
      const userFiles = await UserFileModel.getUserFileByShareId(testShareId);

      // Assert
      expect(userFiles[0].isShared).toBe(0);

      // Arrange - Set file as shared again
      await UserFileModel.updateSharedStatus(testShareId, 1);

      // Act - Verify the update
      const updatedUserFiles = await UserFileModel.getUserFileByShareId(
        testShareId
      );

      // Assert
      expect(updatedUserFiles[0].isShared).toBe(1);
    });
  });

  describe("updateUserFile", () => {
    it("should update a user file", async () => {
      // Arrange
      const updatedFileName = "updated-test-file.json";
      const updatedExpireTime = Date.now() + 172800000; // 48 hours from now

      const userFile = {
        fileName: updatedFileName,
        userId: testUserId,
        jsonId: testJsonId,
        expiredAt: updatedExpireTime,
        isShared: 1,
      };

      // Act
      const result = await UserFileModel.updateUserFile(
        testUserFileId,
        userFile
      );

      // Assert
      expect(result.id).toBe(testUserFileId);

      // Verify the update by fetching the user's files
      const userFiles = await UserFileModel.getUserFilesByUserId(testUserId);
      const updatedFile = userFiles.find((file) => file.id === testUserFileId);

      expect(updatedFile?.fileName).toBe(updatedFileName);
      expect(updatedFile?.expiredAt).toBe(updatedExpireTime);
      expect(updatedFile?.isShared).toBe(1);
    });
  });

  describe("deleteUserFile", () => {
    it("should delete a user file", async () => {
      // Arrange - Create a temporary file to delete
      const tempShareId = randomUUID();
      const tempUserFile = {
        fileName: "temp-file-to-delete.json",
        userId: testUserId,
        jsonId: testJsonId,
        expiredAt: 0,
        isShared: 0,
        shareId: tempShareId,
      };
      const tempResult = await UserFileModel.createUserFile(tempUserFile);
      const tempFileId = tempResult.id;

      // Act
      await UserFileModel.deleteUserFile(tempFileId);

      // Assert - Verify deletion
      const userFiles = await UserFileModel.getUserFilesByUserId(testUserId);
      const deletedFile = userFiles.find((file) => file.id === tempFileId);
      expect(deletedFile).toBeUndefined();
    });
  });
});
