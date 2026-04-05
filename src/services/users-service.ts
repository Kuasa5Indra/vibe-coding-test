import { db } from '../db';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class UsersService {
    static async registerUser(payload: any) {
        try {
            // 1. Check if email already exists
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, payload.email)
            });

            if (existingUser) {
                return { error: 'Email sudah terdaftar' };
            }

            // 2. Hash password
            const hashedPassword = await Bun.password.hash(payload.password);

            // 3. Create user
            await db.insert(users).values({
                name: payload.name,
                email: payload.email,
                password: hashedPassword
            });

            return { data: 'OK' };
        } catch (error) {
            console.error('Registration error:', error);
            return { error: 'Terjadi kesalahan internal server' };
        }
    }

    static async loginUser(data: any) {
        const { email, password } = data;

        // 1. Fetch user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user) {
            return { error: "Email atau password salah" };
        }

        // 2. Verify password
        const isPasswordValid = await Bun.password.verify(password, user.password);

        if (!isPasswordValid) {
            return { error: "Email atau password salah" };
        }

        // 3. Generate session token (UUID)
        const token = crypto.randomUUID();

        // 4. Create session
        await db.insert(sessions).values({
            token,
            userId: user.id
        });

        return { data: token };
    }

    static async getCurrentUser(token: string) {
        // 1. Fetch session and user in one go
        const result = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.token, token));

        const user = result[0];

        if (!user) {
            return { error: "Unauthorized" };
        }

        return { data: user };
    }

    static async logoutUser(token: string) {
        // 1. Check if session exists
        const session = await db.query.sessions.findFirst({
            where: eq(sessions.token, token)
        });

        if (!session) {
            return { error: "Unauthorized" };
        }

        // 2. Delete session
        await db.delete(sessions)
            .where(eq(sessions.token, token));

        return { data: "OK" };
    }
}
