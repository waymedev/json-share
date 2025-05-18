import Koa from 'koa';

const app = new Koa();
const port = process.env.PORT || 3000;

// 简单中间件：响应“Hello, Koa + TypeScript!”
app.use(async ctx => {
    ctx.body = 'Hello, Koa + TypeScript!';
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});