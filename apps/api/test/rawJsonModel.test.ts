import { afterAll, describe, expect, it } from "vitest";
import { RawJsonModel } from "../src/db/rawJsonModel";

interface JsonResult {
  id: number;
}

describe("RawJsonModel", () => {
  let testJsonId: number;
  const testJsonContent = { test: "data", number: 123 };

  // Cleanup if a test fails midway and the delete test doesn't run
  afterAll(async () => {
    try {
      await RawJsonModel.delete(testJsonId);
    } catch (error) {
      // Ignore if already deleted
    }
  });

  describe("add", () => {
    it("should add a new JSON document and return its ID", async () => {
      // Arrange
      const jsonData = {
        jsonContent: testJsonContent,
        refCount: 1,
      };

      // Act
      const result = (await RawJsonModel.add(jsonData)) as JsonResult;

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.id).toBe("number");
      testJsonId = result.id;
    });
  });

  describe("getById", () => {
    it("should retrieve a JSON document by its ID", async () => {
      // Arrange - testJsonId already set from previous test

      // Act
      const result = await RawJsonModel.getById(testJsonId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(testJsonId);
      expect(result.jsonContent).toEqual(testJsonContent);
      expect(result.refCount).toBe(1);
    });

    it("should return null for non-existent ID", async () => {
      // Arrange
      const nonExistentId = 999999;

      // Act
      const result = await RawJsonModel.getById(nonExistentId);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("update", () => {
    it("should update the reference count of a JSON document", async () => {
      // Arrange
      const updatedRefCount = 2;

      // Act
      const result = await RawJsonModel.update(testJsonId, {
        refCount: updatedRefCount,
      });

      // Assert
      expect(result.id).toBe(testJsonId);

      // Verify the update
      const updated = await RawJsonModel.getById(testJsonId);
      expect(updated.refCount).toBe(updatedRefCount);
      expect(updated.jsonContent).toEqual(testJsonContent);
    });
  });

  describe("decrementRefCount", () => {
    it("should decrement the reference count of a JSON document", async () => {
      // Arrange - Get current refCount
      const initialDoc = await RawJsonModel.getById(testJsonId);
      const initialRefCount = initialDoc.refCount;

      // Act
      const result = await RawJsonModel.decrementRefCount(testJsonId);

      // Assert
      expect(result).toEqual({ success: true });

      // Verify the update
      const updated = await RawJsonModel.getById(testJsonId);
      expect(updated.refCount).toBe(initialRefCount - 1);
    });
  });

  describe("delete", () => {
    it("should delete a JSON document", async () => {
      // Arrange - testJsonId already set from previous test

      // Create a new temporary document to delete
      const tempData = {
        jsonContent: { temp: "data" },
        refCount: 1,
      };
      const tempResult = (await RawJsonModel.add(tempData)) as JsonResult;
      const tempId = tempResult.id;

      // Act
      await RawJsonModel.delete(tempId);

      // Assert
      const result = await RawJsonModel.getById(tempId);
      expect(result).toBeUndefined();
    });
  });
});
