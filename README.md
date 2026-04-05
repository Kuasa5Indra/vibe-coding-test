# Vibe Coding Test - Backend API

Proyek ini adalah sistem backend RESTful API sederhana yang dibangun untuk manajemen data pengguna, mencakup kapabilitas autentikasi, registrasi, pengambilan profil diri (current user), dan layanan logout menggunakan sesi berbasis _token Bearer_.

## 🚀 Technology Stack & Libraries
- **Runtime:** [Bun](https://bun.sh/) (JavaScript runtime & bundler tercepat, yang digunakan sebagai _package manager_, _test runner_, dan _environment execution_).
- **Framework:** [ElysiaJS](https://elysiajs.com/) (Web framework ergonomis yang sangat cepat bagi Bun, menawarkan fitur tipe aman ketat bersama _Typebox_).
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (ORM tangguh, bertipe SQL *Typescript-first*, performa mumpuni).
- **Database:** MySQL.
- **Keamanan Sandi:** `Bun.password` yang mengimplementasikan metode hash *Bcrypt*.

## 📂 Arsitektur & Struktur Folder
Aplikasi ini memisahkan lapisan-lapisan pemrosesan ke dalam beberapa direktori sehingga kode _clean_ dan teratur (mengikuti prinsip Layered/Service-based Architecture).
Tata letak penamaan struktur filenya terstandarisasi dengan model `kebab-case`.

```
/src
 ├── /db           # Pengaturan koneksi MySQL & defisini Skema Database Drizzle
 │   ├── index.ts  # Instansiasi & sambungan Drizzle Database
 │   └── schema.ts # Deklarasi tabel (users, sessions), relasi MySQL
 │
 ├── /plugins      # Lapisan ekstensi modular / Middleware kustom tambahan (Reusability)
 │   └── auth-plugin.ts  # Plugin ekstraksi & manajemen token Bearer Elysia
 │
 ├── /routes       # Endpoint API (Lapisan Controller/Transport). Hanya mengurus request/response
 │   └── users-route.ts  # Handler Elysia dan validasi form Typebox untuk manajemen User
 │
 ├── /services     # Lapisan Logika Bisnis (Business Logic) yang mengatur database
 │   └── users-service.ts  # Fungsi logika khusus register, login, get current, logout
 │
 └── index.ts      # Titik awal masuk aplikasi, konfigurasi Elysia HTTP dan Global Error Handling

/tests             # Modul pengujian fungsionalitas unit dan end-to-end (E2E)
 └── users.test.ts # File uji untuk semua modul/api users
```

## 📊 Skema Database
Sistem ini menggunakan 2 buah tabel pada Database MySQL yang terkunci *Foreign Key*.

**1. Tabel `users`**
- `id` (int): *Primary Key*, AI
- `name` (varchar 255): Nama pengguna.
- `email` (varchar 255): Alamat email, *Unique*.
- `password` (varchar 255): Kata sandi, terenkripsi Hashing.
- `created_at` (timestamp): Tanggal pendaftaran.

**2. Tabel `sessions`**
- `id` (int): *Primary Key*, AI
- `token` (varchar 255): UUID Token identitas _login_.
- `userId` (int): Relasi ke `users.id` (*Foreign Key*).
- `created_at` (timestamp): Tanggal waktu _login_.

## 🔌 API Documentation

| Endpoint | Method | Keterangan | Validasi Input Target / Header |
| :--- | :--- | :--- | :--- |
| `/api/users` | `POST` | Mendaftarkan akun baru | Body: `name`, `email` (format valid, max 255), `password` (max 255) |
| `/api/users/login` | `POST` | Autentikasi untuk mendulang sesi UUID. | Body: `email` (format valid, max 255), `password` (max 255) |
| `/api/users/current` | `GET` | Mendapatkan data profil (tanpa _password_). | Header: `Authorization: Bearer <token>` |
| `/api/users/logout` | `DELETE` | Menghapus sesi dan mencabut _token_. | Header: `Authorization: Bearer <token>` |

> Seluruh endpoint divalidasi ketat otomatis melalui Typebox Elysia. Terdapat Error Handler sentral sehingga galat validasi meluapkan bentuk `400 Bad Request` yang ramah konsumsi.

## 🛠️ Cara Setup Project
Langkah-langkah untuk menyiapkan _environment_ lokal.
1. Pastikan **Bun** sudah terinstal di komputer.
2. Clone repository ini.
3. Lakukan instalasi semua modul dependensi dengan perintah eksekusi root:
   ```bash
   bun install
   ```
4. Salin cadangan *environment* `cp .env.example .env` ke akar (*root*). Sesuaikan properti koneksi URL MySQL yang valid.
5. Dorong *schema* terbaru ke Database agar terbentuk otomatis dengan mengeksekusi Drizzle Push:
   ```bash
   bun run db:push
   ```

## 🏃‍♂️ Cara Menjalankan Aplikasi
Gunakan skrip `dev` untuk menghidupkan mesin layanan lokal (Server secara dasar berada di `localhost:3000`):
```bash
bun run dev
```

## 🧪 Cara Menjalankan Pengujian (Test)
Aplikasi telah diuji kekebalan secara ketat termasuk *handling failure/error*. Eksekusi _test-suite_ bun untuk seluruh ujung layanan dan skenario validasinya menggunakan perintah berikut (Pastikan Bun sudah diinstall):

```bash
bun test
```
