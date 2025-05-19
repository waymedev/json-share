import multer from '@koa/multer';
import { randomUUID } from 'crypto';
import Router from 'koa-router';
import { db } from "../db";
import { jsonFiles, userFiles } from "../db/schema";

const upload = multer();
const router = new Router({ prefix: "/api" });

interface FileUploadBody {
    filename: string;
    expirationDays?: string;
}

router.post("/shares", upload.single('file'), async (ctx: any) => {
    const file = ctx.request.file;
    const { filename, expirationDays } = ctx.request.body as FileUploadBody;

    if (!file || !filename) {
        ctx.status = 400;
        ctx.body = { error: "Missing required fields" };
        return;
    }

    try {
        // Parse JSON content from the uploaded file
        let jsonContent: any;
        try {
            const fileContent = file.buffer.toString('utf-8');
            jsonContent = JSON.parse(fileContent);
        } catch (error) {
            ctx.status = 400;
            ctx.body = { error: "Invalid JSON file" };
            return;
        }

        // Create a unique share ID
        const shareId = randomUUID();

        // Calculate expiration date if provided
        let expireAt: Date | null = null;
        if (expirationDays) {
            const days = parseInt(expirationDays);
            if (!isNaN(days) && days > 0) {
                expireAt = new Date();
                expireAt.setDate(expireAt.getDate() + days);
            }
        }

        // Execute both inserts in a transaction
        const result = await db.transaction(async (tx) => {
            // Insert the JSON content
            const [jsonFile] = await tx.insert(jsonFiles).values({
                jsonContent,
                refCount: 1
            }).execute();

            // Get the inserted JSON file ID
            const jsonId = jsonFile.insertId;

            // Insert the user file record
            await tx.insert(userFiles).values({
                fileName: filename,
                userId: 'anonymous',
                jsonId,
                shareId,
                isShared: 0,
                expireAt: expireAt?.toISOString()
            }).execute();

            return { jsonId, shareId };
        });

        ctx.status = 201;
        ctx.body = {
            shareId: result.shareId,
            message: "File shared successfully"
        };
    } catch (error) {
        console.error('Error sharing file:', error);
        ctx.status = 500;
        ctx.body = { error: "Failed to share file" };
    }
});

export default router;