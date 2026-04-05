import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { usersRoute } from './routes/users-route';

export const app = new Elysia()
  .use(swagger({
    path: '/swagger',
    documentation: {
      info: {
        title: 'Vibe Coding Backend API',
        version: '1.0.0',
        description: 'Interactive API documentation for the user management backend.'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  }))
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return error;
    }
  })
  .use(usersRoute)
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
