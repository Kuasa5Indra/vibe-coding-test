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
    });
