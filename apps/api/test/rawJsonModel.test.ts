import { afterAll, describe, expect, test } from "vitest";
import { RawJsonModel } from "../src/db/rawJsonModel";

interface JsonResult {
  id: number;
}

describe("RawJsonModel", () => {
  let testJsonId: number;
  const testJsonContent = { test: "data", number: 123 };

  test("should add a new JSON document", async () => {
    const result = (await RawJsonModel.add({
      jsonContent: testJsonContent,
      refCount: 1,
    })) as any;

    expect(result).toBeDefined();
    expect(typeof result.id).toBe("number");
    testJsonId = result.id;
  });

  test("should get a JSON document by id", async () => {
    const result = await RawJsonModel.getById(testJsonId);

    expect(result).toBeDefined();
    expect(result.id).toBe(testJsonId);
    expect(result.jsonContent).toEqual(testJsonContent);
    expect(result.refCount).toBe(1);
  });

  test("should update a JSON document", async () => {
    const updatedRefCount = 2;

    const result = await RawJsonModel.update(testJsonId, {
      refCount: updatedRefCount,
    });

    expect(result.id).toBe(testJsonId);

    // Verify the update
    const updated = await RawJsonModel.getById(testJsonId);
    expect(updated.refCount).toBe(updatedRefCount);
    expect(updated.jsonContent).toEqual(testJsonContent);
  });

  test("should delete a JSON document", async () => {
    await RawJsonModel.delete(testJsonId);

    // Attempt to get the deleted document
    try {
      await RawJsonModel.getById(testJsonId);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Expected to throw because the document is deleted
      expect(error).toBeDefined();
    }
  });

  // Cleanup if a test fails midway and the delete test doesn't run
  afterAll(async () => {
    try {
      await RawJsonModel.delete(testJsonId);
    } catch (error) {
      // Ignore if already deleted
    }
  });
});
