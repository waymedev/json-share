import { randomUUID } from "crypto";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { RawJsonModel } from "../src/db/rawJsonModel";
import { UserFileModel } from "../src/db/userFileModel";

interface JsonResult {
  id: number;
}

describe("UserFileModel", () => {
  let testJsonId: number;
  let testUserFileId: number;
  const testUserId = "test-user-123";
  const testFileName = "test-file.json";
  const expireTime = Date.now() + 86400000; // 24 hours from now
  const testJsonContent = { test: "user file data" };
  const testShareId = randomUUID();

  // Create a JSON entry first to reference in user files
  beforeAll(async () => {
    const jsonResult = (await RawJsonModel.add({
      jsonContent: testJsonContent,
      refCount: 1,
    })) as JsonResult;
    testJsonId = jsonResult.id;
  });

  test("should create a user file", async () => {
    const userFile = {
      fileName: testFileName,
      userId: testUserId,
      jsonId: testJsonId,
      expiredAt: expireTime,
      isShared: 0,
      shareId: testShareId,
    };

    const result = (await UserFileModel.createUserFile(userFile)) as JsonResult;
    expect(result).toBeDefined();
    expect(typeof result.id).toBe("number");
    testUserFileId = result.id;
  });

  test("should get user files by user ID", async () => {
    const userFiles = await UserFileModel.getUserFilesByUserId(testUserId);

    expect(userFiles).toBeDefined();
    expect(userFiles.length).toBeGreaterThan(0);

    const fileFound = userFiles.find((file) => file.id === testUserFileId);
    expect(fileFound).toBeDefined();
    expect(fileFound?.fileName).toBe(testFileName);
    expect(fileFound?.jsonId).toBe(testJsonId);
  });

  test("should get user file by share ID", async () => {
    const userFiles = await UserFileModel.getUserFileByShareId(testShareId);

    expect(userFiles).toBeDefined();
    expect(userFiles.length).toBe(1);
    expect(userFiles[0].id).toBe(testUserFileId);
    expect(userFiles[0].fileName).toBe(testFileName);
    expect(userFiles[0].userId).toBe(testUserId);
    expect(userFiles[0].shareId).toBe(testShareId);
  });

  test("should list user files by page", async () => {
    const page = 1;
    const pageSize = 10;

    const userFiles = await UserFileModel.getUserFileListByPage(
      testUserId,
      page,
      pageSize,
      false,
      false
    );
    expect(userFiles).toBeDefined();
    expect(Array.isArray(userFiles)).toBe(true);

    // At least our test file should be in the results
    expect(userFiles.length).toBeGreaterThan(0);

    // Find our test file in the results
    const fileFound = userFiles.find((file) => file.id === testUserFileId);
    expect(fileFound).toBeDefined();
  });

  test("should list only expired user files when expiredOnly is true", async () => {
    // Test will be skipped if running in real-time since our file isn't expired yet
    // We'll mock Date.now() to simulate file expiration
    const originalDateNow = Date.now;
    const futureTime = expireTime + 3600000; // 1 hour after expiration
    Date.now = vi.fn(() => futureTime);

    const page = 1;
    const pageSize = 10;

    const userFiles = await UserFileModel.getUserFileListByPage(
      testUserId,
      page,
      pageSize,
      true,
      false
    );

    // Since our test file is now "expired", it should be in the results
    const fileFound = userFiles.find((file) => file.id === testUserFileId);
    expect(fileFound).toBeDefined();

    // Restore original Date.now
    Date.now = originalDateNow;
  });

  test("should list only shared user files when sharedOnly is true", async () => {
    // First update our file to be shared
    await UserFileModel.updateSharedStatus(testShareId, 1);

    const page = 1;
    const pageSize = 10;

    const userFiles = await UserFileModel.getUserFileListByPage(
      testUserId,
      page,
      pageSize,
      false,
      true
    );

    // Since our test file is now shared, it should be in the results
    const fileFound = userFiles.find((file) => file.id === testUserFileId);
    expect(fileFound).toBeDefined();
  });

  test("should get page count of user files", async () => {
    const pageSize = 10;

    const pageCount = await UserFileModel.getUserFileListPageCount(pageSize);
    expect(pageCount).toBeDefined();
    expect(typeof pageCount).toBe("number");
    expect(pageCount).toBeGreaterThan(0);
  });

  test("should get the count of user files", async () => {
    // Get all files count
    const allFilesCount = await UserFileModel.getUserFilesCount(
      testUserId,
      false,
      false
    );
    expect(allFilesCount).toBeGreaterThan(0);

    // Mock Date.now to test expired files count
    const originalDateNow = Date.now;
    const futureTime = expireTime + 3600000; // 1 hour after expiration
    Date.now = vi.fn(() => futureTime);

    const expiredFilesCount = await UserFileModel.getUserFilesCount(
      testUserId,
      true,
      false
    );
    expect(expiredFilesCount).toBeGreaterThan(0);

    // Restore original Date.now
    Date.now = originalDateNow;

    // Test shared files count
    const sharedFilesCount = await UserFileModel.getUserFilesCount(
      testUserId,
      false,
      true
    );
    expect(sharedFilesCount).toBeGreaterThan(0);
  });

  test("should update shared status of a file", async () => {
    // Set file as not shared
    await UserFileModel.updateSharedStatus(testShareId, 0);

    // Verify the update
    const userFiles = await UserFileModel.getUserFileByShareId(testShareId);
    expect(userFiles[0].isShared).toBe(0);

    // Set file as shared again
    await UserFileModel.updateSharedStatus(testShareId, 1);

    // Verify the update
    const updatedUserFiles = await UserFileModel.getUserFileByShareId(
      testShareId
    );
    expect(updatedUserFiles[0].isShared).toBe(1);
  });

  test("should update a user file", async () => {
    const updatedFileName = "updated-test-file.json";
    const updatedExpireTime = Date.now() + 172800000; // 48 hours from now

    const userFile = {
      fileName: updatedFileName,
      userId: testUserId,
      jsonId: testJsonId,
      expiredAt: updatedExpireTime,
      isShared: 1,
    };

    const result = await UserFileModel.updateUserFile(testUserFileId, userFile);
    expect(result.id).toBe(testUserFileId);

    // Verify the update by fetching the user's files
    const userFiles = await UserFileModel.getUserFilesByUserId(testUserId);
    const updatedFile = userFiles.find((file) => file.id === testUserFileId);

    expect(updatedFile?.fileName).toBe(updatedFileName);
    expect(updatedFile?.expiredAt).toBe(updatedExpireTime);
    expect(updatedFile?.isShared).toBe(1);
  });

  test("should delete a user file", async () => {
    await UserFileModel.deleteUserFile(testUserFileId);

    // Verify deletion
    const userFiles = await UserFileModel.getUserFilesByUserId(testUserId);
    const deletedFile = userFiles.find((file) => file.id === testUserFileId);
    expect(deletedFile).toBeUndefined();
  });

  // Cleanup after all tests
  afterAll(async () => {
    try {
      // Try to delete the user file if it wasn't already deleted
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
});
