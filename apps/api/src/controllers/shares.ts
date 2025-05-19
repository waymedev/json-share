import multer from "@koa/multer";
import { randomUUID } from "crypto";
import Router from "koa-router";
import { db } from "../db";
import { jsonFiles, userFiles } from "../db/schema";
import { successResponse } from "../utils/Response";

const upload = multer();
const router = new Router({ prefix: "/api" });

interface FileUploadBody {
  filename: string;
  expiration_days?: string;
  user_id: string;
}

/**
 * @openapi
 * /info:
 *  get:
 *    description: 获取基本配置信息
 *    responses:
 *      200:
 *        description: 配置信息对象.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                host_url:
 *                  type: string
 */
router.post("/shares", upload.single("file"), async (ctx: any) => {
  const file = ctx.request.file;
  // get x-user-id from header
  const user_id = ctx.request.header["x-user-id"];
  if (!user_id) {
    ctx.status = 400;
    ctx.body = { error: "Missing user_id fields" };
    return;
  }
  const { filename, expiration_days } = ctx.request.body as FileUploadBody;

  if (!file || !filename) {
    ctx.status = 400;
    ctx.body = { error: "Missing required fields" };
    return;
  }

  // Parse JSON content from the uploaded file
  let jsonContent: any;
  try {
    const fileContent = file.buffer.toString("utf-8");
    jsonContent = JSON.parse(fileContent);
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: "Invalid JSON file" };
    return;
  }

  // Create a unique share ID
  const shareId = randomUUID();

  // Calculate expiration date if provided
  let expireAt: number | null = null;
  if (expiration_days) {
    const days = parseInt(expiration_days);
    if (!isNaN(days) && days > 0) {
      const timestamp = Date.now() + days * 24 * 60 * 60 * 1000;
      expireAt = timestamp;
    }
  }

  // Execute both inserts in a transaction
  const result = await db.transaction(async (tx) => {
    // Insert the JSON content
    const [jsonFile] = await tx
      .insert(jsonFiles)
      .values({
        jsonContent,
        refCount: 1,
      })
      .execute();

    // Get the inserted JSON file ID
    const jsonId = jsonFile.insertId;

    // Insert the user file record
    await tx
      .insert(userFiles)
      .values({
        fileName: filename,
        userId: user_id,
        jsonId,
        shareId,
        isShared: 1,
        expireAt: expireAt ?? 0,
      })
      .execute();

    return { jsonId, shareId };
  });

  ctx.body = successResponse(
    {
      share_id: result.shareId,
    },
    "File shared successfully"
  );
});

export default router;
