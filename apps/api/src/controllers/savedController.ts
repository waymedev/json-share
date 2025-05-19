// import Router from "koa-router";
// import { SavedService } from "../services/savedService";
// import { successResponse } from "../utils/Response";
// import {
//   ErrorType,
//   handleApiError,
//   requireUserId,
// } from "../utils/errorHandler";

// const router = new Router({ prefix: "/api" });

// interface SaveFileBody {
//   share_id: string;
// }

// /**
//  * 收藏文件
//  * @param ctx Koa context object
//  * @returns void
//  */
// router.post("/saved", async (ctx) => {
//   const userId = requireUserId(ctx);
//   if (!userId) return; // 如果验证失败，函数已经设置了错误响应

//   const { share_id } = ctx.request.body as SaveFileBody;

//   if (!share_id) {
//     handleApiError(ctx, ErrorType.MISSING_FIELDS);
//     return;
//   }

//   // Save the file using SavedService
//   const result = await SavedService.saveFile(share_id, userId);

//   if (result.success) {
//     ctx.body = successResponse(result.data, result.message);
//   } else {
//     // 使用服务返回的错误类型
//     handleApiError(
//       ctx,
//       result.errorType || ErrorType.INTERNAL_ERROR,
//       result.message
//     );
//   }
// });

// /**
//  * 获取收藏列表
//  * @param ctx Koa context object
//  * @returns void
//  */
// router.get("/saved", async (ctx) => {
//   const userId = requireUserId(ctx);
//   if (!userId) return; // 如果验证失败，函数已经设置了错误响应

//   // Parse pagination parameters
//   const page = parseInt(ctx.query.page as string) || 1;
//   const size = parseInt(ctx.query.size as string) || 20;

//   // Get the saved files using the service
//   const result = await SavedService.getSavedFiles(userId, page, size);

//   if (result.success) {
//     ctx.body = successResponse(result.data, result.message);
//   } else {
//     // 使用服务返回的错误类型
//     handleApiError(
//       ctx,
//       result.errorType || ErrorType.INTERNAL_ERROR,
//       result.message
//     );
//   }
// });

// /**
//  * 取消收藏
//  * @param ctx Koa context object
//  * @returns void
//  */
// router.delete("/saved/:id", async (ctx) => {
//   const userId = requireUserId(ctx);
//   if (!userId) return; // 如果验证失败，函数已经设置了错误响应

//   const id = parseInt(ctx.params.id);
//   if (isNaN(id)) {
//     handleApiError(ctx, ErrorType.BAD_REQUEST, "Invalid ID format");
//     return;
//   }

//   // Remove the saved file using SavedService
//   const result = await SavedService.removeSavedFile(id, userId);

//   if (result.success) {
//     ctx.body = successResponse(null, result.message);
//   } else {
//     // 使用服务返回的错误类型
//     handleApiError(
//       ctx,
//       result.errorType || ErrorType.INTERNAL_ERROR,
//       result.message
//     );
//   }
// });

// export default router;
