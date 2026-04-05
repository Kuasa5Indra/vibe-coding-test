import { db } from '../db';
import { users } from '../db/schema';
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
}
