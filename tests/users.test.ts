import { describe, it, expect, spyOn, jest } from 'bun:test';
import { app } from '../src/index';
import { UsersService } from '../src/services/users-service';

describe('Users API', () => {
    
    describe('POST /api/users (Registration)', () => {
        it('should register a new user successfully', async () => {
            const spy = spyOn(UsersService, 'registerUser').mockResolvedValue({ data: 'OK' });
            
            const response = await app.handle(
                new Request('http://localhost/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'Test User',
                        email: 'test@example.com',
                        password: 'password123'
                    })
                })
            );

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ data: 'OK' });
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it('should return 400 for duplicate email', async () => {
            spyOn(UsersService, 'registerUser').mockResolvedValue({ error: 'Email sudah terdaftar' });
            
            const response = await app.handle(
                new Request('http://localhost/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'Test User',
                        email: 'test@example.com',
                        password: 'password123'
                    })
                })
            );

            expect(response.status).toBe(400);
            expect(await response.json()).toEqual({ error: 'Email sudah terdaftar' });
        });

        it('should return 400 for invalid email format', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'Test User',
                        email: 'not-an-email',
                        password: 'password123'
                    })
                })
            );

            expect(response.status).toBe(400);
        });

        it('should return 400 for name exceeding 255 characters', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'A'.repeat(256),
                        email: 'test@example.com',
                        password: 'password123'
                    })
                })
            );

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/users/login', () => {
        it('should return a token for valid credentials', async () => {
            const token = 'test-token-uuid';
            spyOn(UsersService, 'loginUser').mockResolvedValue({ data: token });
            
            const response = await app.handle(
                new Request('http://localhost/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'test@example.com',
                        password: 'password123'
                    })
                })
            );

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ data: token });
        });

        it('should return 401 for invalid credentials', async () => {
            spyOn(UsersService, 'loginUser').mockResolvedValue({ error: 'Email atau password salah' });
            
            const response = await app.handle(
                new Request('http://localhost/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'test@example.com',
                        password: 'wrong-password'
                    })
                })
            );

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Email atau password salah' });
        });
    });

    describe('GET /api/users/current', () => {
        it('should return current user for valid token', async () => {
            const user = { id: 1, name: 'Test User', email: 'test@example.com', createdAt: new Date().toISOString() };
            spyOn(UsersService, 'getCurrentUser').mockResolvedValue({ data: user });
            
            const response = await app.handle(
                new Request('http://localhost/api/users/current', {
                    method: 'GET',
                    headers: { 'Authorization': 'Bearer valid-token' }
                })
            );

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ data: user });
        });

        it('should return 401 if Authorization header is missing', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/users/current', {
                    method: 'GET'
                })
            );

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });

        it('should return 401 for invalid session', async () => {
            spyOn(UsersService, 'getCurrentUser').mockResolvedValue({ error: 'Unauthorized' });

            const response = await app.handle(
                new Request('http://localhost/api/users/current', {
                    method: 'GET',
                    headers: { 'Authorization': 'Bearer invalid-token' }
                })
            );

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });

    describe('DELETE /api/users/logout', () => {
        it('should logout successfully with valid token', async () => {
            spyOn(UsersService, 'logoutUser').mockResolvedValue({ data: 'OK' });
            
            const response = await app.handle(
                new Request('http://localhost/api/users/logout', {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer valid-token' }
                })
            );

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ data: 'OK' });
        });

        it('should return 401 for unauthorized logout attempt', async () => {
            spyOn(UsersService, 'logoutUser').mockResolvedValue({ error: 'Unauthorized' });

            const response = await app.handle(
                new Request('http://localhost/api/users/logout', {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer invalid-token' }
                })
            );

            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });
    });
});
