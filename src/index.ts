import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/', () => ({
    status: 'ok',
    message: 'Backend is running with Bun + Elysia + Drizzle + MySQL',
    timestamp: new Date().toISOString()
  }))
  .get('/health', () => 'OK')
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
