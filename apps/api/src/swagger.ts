import Router from "koa-router";
import swaggerJSDoc from "swagger-jsdoc";

const router = new Router();

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Json Share API",
      version: "1.0.0",
      description: "Json Share API",
    },
    servers: [{ url: "http://localhost:3000", description: "本地开发" }],
  },
  // 扫描你的接口注释文件
  apis: ["./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

router.get("/swagger.json", async (ctx) => {
  ctx.set("Content-Type", "application/json");
  ctx.body = swaggerSpec;
});
export default router;
