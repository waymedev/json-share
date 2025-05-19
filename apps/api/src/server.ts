import { bodyParser } from '@koa/bodyparser';
import multer from '@koa/multer';
import Koa from 'koa';
import uploadRouter from './controllers/shares';
import { errorHandler } from './middleware/errorHandler';

const app = new Koa();
const port = process.env.PORT || 3000;
// 环境判断
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';


// Configure multer for file uploads
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Error Handler
app.use(errorHandler(env));

app.on('error', (err, ctx) => {
    // 区分开发/生产
    if (env === 'development') {
      console.error('Unhandled error occurred:', err);
    } else {
      // 生产环境只记录必要字段
      console.error({
        message: err.message,
        status: err.status || 500,
        path: ctx.path,
        method: ctx.method,
        // 不暴露堆栈
      });
    }
  });

// Middleware
app.use(bodyParser());

// Routes
app.use(uploadRouter.routes());
app.use(uploadRouter.allowedMethods());

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});