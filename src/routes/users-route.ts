import { Elysia, t } from 'elysia';
import { UsersService } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
    .post('/', async ({ body, set }) => {
        const result = await UsersService.registerUser(body);

        if (result.error) {
            set.status = 400;
            return result;
        }

        return result;
    }, {
        body: t.Object({
            name: t.String(),
            email: t.String({ format: 'email' }),
            password: t.String()
        })
    })
    .post('/login', async ({ body, set }) => {
        const result = await UsersService.loginUser(body);

        if (result.error) {
            set.status = 401;
            return result;
        }

        return result;
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String()
        })
    })
    .get('/current', async ({ headers, set }) => {
        const authHeader = headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const token = authHeader.split(' ')[1];
        const result = await UsersService.getCurrentUser(token);

        if (result.error) {
            set.status = 401;
            return result;
        }

        return result;
    })
    .delete('/logout', async ({ headers, set }) => {
        const authHeader = headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const token = authHeader.split(' ')[1];
        const result = await UsersService.logoutUser(token);

        if (result.error) {
            set.status = 401;
            return result;
        }

        return result;
    });
