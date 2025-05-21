import { and, count, desc, eq, lt, ne, not, SQLWrapper } from "drizzle-orm";
import { db } from ".";
import { userFiles } from "./schema";

interface UserFile {
  fileName: string;
  userId: string;
  jsonId: number;
  expiredAt: number;
  isShared: number;
}

function condition(userId: string, expiredOnly: boolean, sharedOnly: boolean) {
  // Build the where conditions
  const baseCondition = eq(userFiles.userId, userId);

  // Create filter conditions
  let filterCondition = undefined;
  const expiredCondition = and(
    lt(userFiles.expiredAt, Date.now()),
    ne(userFiles.expiredAt, 0)
  );

  if (expiredOnly) {
    // Expired files: expiredAt < now AND expiredAt != 0
    filterCondition = expiredCondition;
  } else if (sharedOnly) {
    // Shared files: isShared = 1
    // except expired files

    filterCondition = and(
      eq(userFiles.isShared, 1),
      not(expiredCondition as SQLWrapper)
    );
  }

  return { baseCondition, filterCondition };
}

export class UserFileModel {
  static async createUserFile(userFile: UserFile) {
    const newUserFile = await db.insert(userFiles).values(userFile).execute();
    const insertId = newUserFile[0].insertId;
    return { id: insertId };
  }

  static async getUserFileListByPage(
    userId: string,
    page: number,
    pageSize: number,
    expiredOnly: boolean,
    sharedOnly: boolean
  ) {
    const { baseCondition, filterCondition } = condition(
      userId,
      expiredOnly,
      sharedOnly
    );

    // Combine base condition with filter (if any)
    const whereCondition = filterCondition
      ? and(baseCondition, filterCondition)
      : baseCondition;

    // Execute query with the combined condition
    const userFilesList = await db
      .select()
      .from(userFiles)
      .where(whereCondition)
      .limit(pageSize)
      .orderBy(desc(userFiles.updatedAt))
      .offset((page - 1) * pageSize);

    return userFilesList;
  }

  // calculate the page count
  static async getUserFileListPageCount(pageSize: number) {
    const [userFilesCount] = await db
      .select({ count: count() })
      .from(userFiles);
    return Math.ceil(userFilesCount.count / pageSize);
  }

  static async updateUserFile(id: number, userFile: UserFile) {
    await db.update(userFiles).set(userFile).where(eq(userFiles.id, id));
    return { id };
  }

  static async deleteUserFile(id: number) {
    await db.delete(userFiles).where(eq(userFiles.id, id));
  }

  static async getUserFilesByUserId(userId: string) {
    const userFile = await db
      .select()
      .from(userFiles)
      .where(eq(userFiles.userId, userId));
    return userFile;
  }

  static async getUserFileByShareId(shareId: string) {
    const userFile = await db
      .select()
      .from(userFiles)
      .where(eq(userFiles.shareId, shareId));
    return userFile;
  }

  static async updateSharedStatus(
    shareId: string,
    isShared: number,
    txOrDb: any = db
  ) {
    await txOrDb
      .update(userFiles)
      .set({ isShared })
      .where(eq(userFiles.shareId, shareId))
      .execute();
    return { success: true };
  }

  // Get the total count of user files
  static async getUserFilesCount(
    userId: string,
    expiredOnly: boolean,
    sharedOnly: boolean
  ) {
    const { baseCondition, filterCondition } = condition(
      userId,
      expiredOnly,
      sharedOnly
    );

    // Combine base condition with filter (if any)
    const whereCondition = filterCondition
      ? and(baseCondition, filterCondition)
      : baseCondition;

    const [result] = await db
      .select({ value: count() })
      .from(userFiles)
      .where(whereCondition);

    return result.value;
  }
}
