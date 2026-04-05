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
            name: t.String({ maxLength: 255 }),
            email: t.String({ format: 'email', maxLength: 255 }),
            password: t.String({ maxLength: 255 })
        }),
        response: {
            200: t.Object({ data: t.String() }),
            400: t.Object({ error: t.String() })
        },
        detail: {
            tags: ['Users'],
            summary: 'Register a new user',
            description: 'Create a new user account with the provided name, email, and password.'
        }
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
            email: t.String({ format: 'email', maxLength: 255 }),
            password: t.String({ maxLength: 255 })
        }),
        response: {
            200: t.Object({ data: t.String() }),
            401: t.Object({ error: t.String() })
        },
        detail: {
            tags: ['Users'],
            summary: 'User Login',
            description: 'Authenticate a user with their email and password to receive a session token.'
        }
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
    }, {
        response: {
            200: t.Object({
                data: t.Object({
                    id: t.Number(),
                    name: t.String(),
                    email: t.String({ format: 'email' }),
                    createdAt: t.Any()
                })
            }),
            401: t.Object({ error: t.String() })
        },
        detail: {
            tags: ['Users'],
            summary: 'Get Current User Profile',
            description: 'Retrieve the profile information of the currently authenticated user.',
            security: [{ bearerAuth: [] }]
        }
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
    }, {
        response: {
            200: t.Object({ data: t.String() }),
            401: t.Object({ error: t.String() })
        },
        detail: {
            tags: ['Users'],
            summary: 'User Logout',
            description: 'Terminate the current user session by revoking the provided token.',
            security: [{ bearerAuth: [] }]
        }
    });
