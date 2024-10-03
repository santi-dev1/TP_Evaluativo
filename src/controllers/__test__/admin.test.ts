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
let hackerToken: string

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

    hackerToken = jwt.sign(
        { id: 999, email: 'hacker@hcaker.com', rol: 'hacker' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
});

afterAll(async () => {
    await db.close();
});


describe('POST /api/admins/register', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .post('/api/admins/register')

        expect(response.status).toBe(401)
        expect(response.text).toBe('Sin token en el header')

        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .post('/api/admins/register')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo el superusuario esta autorizado')

        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .post('/api/admins/register')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({})

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should create a new admin', async () => {
        const response = await request(app)
            .post('/api/admins/register')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                name: "Admin - Testing",
                email: "admintseting@admin.com",
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

describe('GET /api/admins', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .get('/api/admins')
            .set('Authorization', `Bearer ${hackerToken}`)
        expect(response.status).toBe(409)
        expect(response.text).toBe('Usuario no valido')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .get('/api/admins')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo el superusuario esta autorizado')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should show all admins', async () => {
        const response = await request(app)
            .get('/api/admins')
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

describe('GET /api/admins/:adminId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .get('/api/admins/1')
            .set('Authorization', `Bearer asdfasdf`)
        expect(response.status).toBe(403)
        expect(response.text).toBe('Token no valido')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .get('/api/admins/1')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo el superusuario esta autorizado')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .get('/api/admins/asdf')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should return 404 non existent admin', async () => {
        const adminId = 999
        const response = await request(app)
            .get(`/api/admins/${adminId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(404)
        expect(response.text).toBe('El Admin no Existe')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should show an admin', async () => {
        const adminId = 1
        const response = await request(app)
            .get(`/api/admins/${adminId}`)
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

describe('PUT /api/admins/:adminId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .put('/api/admins/1')

        expect(response.status).toBe(401)
        expect(response.text).toBe('Sin token en el header')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .put('/api/admins/1')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo el superusuario esta autorizado')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .put('/api/admins/1')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({})

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should return 404 non existent admin', async () => {
        const adminId = 999
        const response = await request(app)
            .put(`/api/admins/${adminId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                name: "Admin - Testing",
                email: "admintesting@admin.com",
                password: "password1"
            })

        expect(response.status).toBe(404)
        expect(response.text).toBe('El Admin no Existe')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should edit an admin', async () => {
        const adminId = 2
        const response = await request(app)
            .put(`/api/admins/${adminId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                name: "Admin - Testing",
                email: "admintesting@admin.com",
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

describe('DELETE /api/admins/:adminId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .delete('/api/admins/1')

        expect(response.status).toBe(401)
        expect(response.text).toBe('Sin token en el header')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .delete('/api/admins/1')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo el superusuario esta autorizado')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .delete('/api/admins/asdf')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should return 404 non existent admin', async () => {
        const adminId = 999
        const response = await request(app)
            .delete(`/api/admins/${adminId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(404)
        expect(response.text).toBe('El Admin no Existe')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display that you are not allowed to delete superuser', async () => {
        const adminId = 1
        const response = await request(app)
            .delete(`/api/admins/${adminId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(409)
        expect(response.text).toBe('No se puede eliminar el superusuario')

        expect(response.status).not.toBe(200)
        expect(response.text).not.toBe('Admin eliminado')
    })

    it('should delete an admin', async () => {
        const adminId = 2
        const response = await request(app)
            .delete(`/api/admins/${adminId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(200)
        expect(response.text).toBe('Admin eliminado')

        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
        expect(response.body).not.toHaveProperty('errors')
    })
})
