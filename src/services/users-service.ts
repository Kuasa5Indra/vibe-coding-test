import { db } from '../db';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class UsersService {
    static async registerUser(data: any) {
        const { name, email, password } = data;

        // 1. Check if email already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (existingUser) {
            return { error: "Email sudah terdaftar" };
        }

        // 2. Hash password with bcrypt (via Bun.password)
        const passwordHash = await Bun.password.hash(password, {
            algorithm: "bcrypt",
            cost: 10
        });

        // 3. Insert into database
        await db.insert(users).values({
            name,
            email,
            password: passwordHash
        });

        return { data: "OK" };
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
}
