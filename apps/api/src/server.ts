import { bodyParser } from '@koa/bodyparser';
import multer from '@koa/multer';
import Koa from 'koa';
import uploadRouter from './controllers/upload';

const app = new Koa();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
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