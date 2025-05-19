import { eq, sql } from "drizzle-orm";
import { db } from ".";
import { rawJson } from "./schema";

interface RawJson {
  jsonContent: any;
  refCount?: number;
}

export class RawJsonModel {
  static async add(data: RawJson) {
    const result = await db.insert(rawJson).values(data).execute();
    const insertId = result[0].insertId;
    return { id: insertId };
  }

  static async update(id: number, data: Partial<RawJson>) {
    await db.update(rawJson).set(data).where(eq(rawJson.id, id));
    return { id };
  }

  static async delete(id: number) {
    await db.delete(rawJson).where(eq(rawJson.id, id));
  }

  static async getById(id: number) {
    const [rawJsonData] = await db
      .select()
      .from(rawJson)
      .where(eq(rawJson.id, id));
    return rawJsonData;
  }

  static async decrementRefCount(jsonId: number, txOrDb: any = db) {
    await txOrDb
      .update(rawJson)
      .set({ refCount: sql`${rawJson.refCount} - 1` })
      .where(eq(rawJson.id, jsonId))
      .execute();
    return { success: true };
  }
}
