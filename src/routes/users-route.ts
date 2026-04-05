import { Elysia, t } from 'elysia';
import { UsersService } from '../services/users-service';
import { authPlugin } from '../plugins/auth-plugin';

export const usersRoute = new Elysia({ prefix: '/api/users' })
    .use(authPlugin)
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
    .get('/current', async ({ token, set }) => {
        if (!token) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const validToken: string = token;
        const result = await UsersService.getCurrentUser(validToken);

        if (result.error) {
            set.status = 401;
            return result;
        }

        return result;
    })
    .delete('/logout', async ({ token, set }) => {
        if (!token) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const validToken: string = token;
        const result = await UsersService.logoutUser(validToken);

        if (result.error) {
            set.status = 401;
            return result;
        }

        return result;
    });
