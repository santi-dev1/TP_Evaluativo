import request from 'supertest';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';
import app from '../../server';
import db from '../../config/db';
import { hashPassword } from '../../helpers';
import User from '../../models/User.model';

dotenv.config()
let tokenAdmin: string
let tokenUser: string

beforeAll(async () => {
    await db.authenticate();
    await db.sync();

    await User.create({
        name: 'user',
        email: 'user@user.com',
        password: await hashPassword('user')
    })

    tokenAdmin = jwt.sign(
        { id: 1, email: 'super@super.com', rol: 'superadmin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    tokenUser = jwt.sign(
        { id: 1, email: 'user@user.com', rol: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
});

afterAll(async () => {
    await db.close();
});


describe('POST /api/users/register', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .post('/api/users/register')

        expect(response.status).toBe(401)
        expect(response.text).toBe('Sin token en el header')

        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo administradores estan autorizados')

        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({})

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should create a new user', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                name: "User - Testing",
                email: "usertseting@user.com",
                password: "password1"
            })

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('data')

        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
        expect(response.body).not.toHaveProperty('errors')
    })
})

describe('GET /api/users', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .get('/api/users')

        expect(response.status).toBe(401)
        expect(response.text).toBe('Sin token en el header')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo administradores estan autorizados')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should show all users', async () => {
        const response = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')

        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
        expect(response.body).not.toHaveProperty('errors')
    })
})

describe('GET /api/users/:userId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .get('/api/users/1')

        expect(response.status).toBe(401)
        expect(response.text).toBe('Sin token en el header')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .get('/api/users/1')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo administradores estan autorizados')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .get('/api/users/asdf')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should return 404 non existent user', async () => {
        const userId = 999
        const response = await request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(404)
        expect(response.text).toBe('El Usuario no Existe')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should show an user', async () => {
        const userId = 1
        const response = await request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')

        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
        expect(response.body).not.toHaveProperty('errors')
    })
})

describe('PUT /api/users/:userId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .put('/api/users/1')

        expect(response.status).toBe(401)
        expect(response.text).toBe('Sin token en el header')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .put('/api/users/1')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo administradores estan autorizados')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .put('/api/users/1')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({})

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should return 404 non existent user', async () => {
        const userId = 999
        const response = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                name: "user - Testing",
                email: "usertesting@user.com",
                password: "password1"
            })

        expect(response.status).toBe(404)
        expect(response.text).toBe('El Usuario no Existe')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should edit an user', async () => {
        const userId = 1
        const response = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                name: "User - Testing",
                email: "usertesting@user.com",
                password: "password1"
            })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')

        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
        expect(response.body).not.toHaveProperty('errors')
    })
})

describe('DELETE /api/users/:userId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .delete('/api/users/1')

        expect(response.status).toBe(401)
        expect(response.text).toBe('Sin token en el header')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .delete('/api/users/1')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo administradores estan autorizados')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .delete('/api/users/asdf')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should return 404 non existent user', async () => {
        const userId = 999
        const response = await request(app)
            .delete(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(404)
        expect(response.text).toBe('El Usuario no Existe')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should delete an user', async () => {
        const userId = 2
        const response = await request(app)
            .delete(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(200)
        expect(response.text).toBe('Usuario eliminado')

        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
        expect(response.body).not.toHaveProperty('errors')
    })
})
