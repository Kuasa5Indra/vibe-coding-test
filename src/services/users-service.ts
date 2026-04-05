import { db } from '../db';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class UsersService {
    /**
     * Mendaftarkan pengguna baru ke dalam database.
     * Fungsi ini akan mengecek apakah email sudah terdaftar, lalu melakukan hashing pada password, 
     * dan menyimpannya ke tabel `users`. Jika terjadi kesalahan database, akan mengembalikan pesan galat umum.
     * 
     * @param payload Objek yang berisi `name`, `email`, dan `password`.
     * @returns Objek dengan properti `data` (jika sukses) atau `error` (jika gagal).
     */
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

    /**
     * Memverifikasi kredensial pengguna dan membuat sesi masuk (login).
     * Fungsi ini akan mencari pengguna berdasarkan email, melakukan validasi hash password, 
     * dan bila berhasil, akan membuat random UUID sebagai token yang dicatat di tabel `sessions`.
     * 
     * @param data Objek yang berisi `email` dan `password`.
     * @returns Objek dengan properti `data` berupa token sesi, atau `error` jika autentikasi gagal.
     */
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

    /**
     * Mengambil detail profil otentikasi pengguna yang sedang aktif (Current User) berdasarkan token sesi.
     * Profil yang dikembalikan tidak menyertakan kolom password demi keamanan (password difilter dari skema select).
     * 
     * @param token String token Bearer (UUID) milik sesi yang diperiksa.
     * @returns Objek `data` profil pengguna jika sesi ditemukan, atau `error` jika tidak dikenali (Unauthorized).
     */
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

    /**
     * Melakukan proses log-out atau pengakhiran sesi pengguna yang aktif.
     * Fungsi ini akan menghapus jejak token terkait di dalam tabel `sessions` agar token
     * tersebut langsung kehilangan akses (kadaluarsa dengan paksa).
     * 
     * @param token String token Bearer (UUID) yang akan dihapus aksesnya.
     * @returns Objek balikan `data: "OK"` bila sukses terhapus, atau `error` unauthorized jika tidak sah.
     */
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
