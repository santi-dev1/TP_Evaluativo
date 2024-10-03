import path from 'path'
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
let tokenUser2: string
let hackerToken: string

beforeAll(async () => {
    await db.authenticate();
    await db.sync();

    //Se crea 2 usuarios
    await User.create({
        name: 'user',
        email: 'user@user.com',
        password: await hashPassword('password')
    })

    await User.create({
        name: 'user',
        email: 'user1@user.com',
        password: await hashPassword('password')
    })

    
    tokenAdmin = jwt.sign(
        { id: 1, email: 'super@super.com', rol: 'superadmin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    //Tokens para cada usuario
    tokenUser = jwt.sign(
        { id: 1, email: 'user@user.com', rol: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    tokenUser2 = jwt.sign(
        { id: 2, email: 'user1@user.com', rol: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    hackerToken = jwt.sign(
        { id: 1, email: 'hacker@hcaker.com', rol: 'hacker' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
});

afterAll(async () => {
    await db.close();
});

describe('POST /api/receipts', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .post('/api/receipts/1')
            .set('Authorization', `Bearer asdfasdf`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Token no valido')

        expect(response.status).not.toBe(201)
    })

    it('should display unauthorized errors', async () => {

        const pdfFilePath = path.resolve(__dirname, './prueba.pdf');

        const response = await request(app)
            .post('/api/receipts/1')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo administradores estan autorizados')

        expect(response.status).not.toBe(201)
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .post('/api/receipts/asdf')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(201)
    })

    it('should return 404 non existent user', async () => {
        const userId = 999
        const response = await request(app)
            .post(`/api/receipts/${userId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .field('description', 'asdfasdfasd')
            .field('amount', 123123);

        expect(response.status).toBe(404)
        expect(response.text).toBe('Usuario No Existe')

        expect(response.status).not.toBe(201)
    })

    it('should display must sent a file error', async () => {
        const response = await request(app)
            .post('/api/receipts/1')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .field('description', 'asdfasdfasd')
            .field('amount', 123123);

        expect(response.status).toBe(403)
        expect(response.text).toBe('Archivo obligatorio')

        expect(response.status).not.toBe(201)
    })

    it('should display file must be a pdf error', async () => {
        
        const pdfFilePath = path.resolve(__dirname, './prueba.txt');

        const response = await request(app)
            .post('/api/receipts/1')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .attach('file', pdfFilePath)
            .field('description', 'asdfasdfasd')
            .field('amount', 123123);

        expect(response.status).toBe(403)
        expect(response.body.msg).toBe('Archivo no valido, tipo de archivos permitidos: pdf');

        expect(response.status).not.toBe(201)
    })

    it('should create a receipt', async () => {

        const pdfFilePath = path.resolve(__dirname, './prueba.pdf');

        const response = await request(app)
            .post('/api/receipts/1')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .attach('file', pdfFilePath)
            .field('description', 'asdfasdfasd')
            .field('amount', 123123);

        expect(201);
        expect(response.text).toBe('Recibo creado correctamente');
    });
})

describe('GET /api/receipts', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .get('/api/receipts')
            .set('Authorization', `Bearer asdfasdf`)
        expect(response.status).toBe(403)
        expect(response.text).toBe('Token no valido')

        expect(response.status).not.toBe(201)
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .get('/api/receipts')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo administradores estan autorizados')

        expect(response.status).not.toBe(201)
    })

    it('should show receipts', async () => {
        const response = await request(app)
            .get('/api/receipts')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')

        expect(response.status).not.toBe(404)
    })
})

describe('GET /api/receipts/:receiptId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .get('/api/receipts/1')
        expect(response.status).toBe(401)
        expect(response.text).toBe('Sin token en el header')

        expect(response.status).not.toBe(200)
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .get('/api/receipts/1')
            .set('Authorization', `Bearer ${hackerToken}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('No autorizado')

        expect(response.status).not.toBe(200)
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .get('/api/receipts/asdfasd')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display non existent receipt error', async () => {
        const receiptId = 999
        const response = await request(app)
            .get(`/api/receipts/${receiptId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(404)
        expect(response.text).toBe('El Recibo no Existe')

        expect(response.status).not.toBe(200)
    })

    it('should display not your receipt error if user', async () => {
        const response = await request(app)
            .get(`/api/receipts/1`)
            .set('Authorization', `Bearer ${tokenUser2}`)

        expect(response.status).toBe(409)
        expect(response.text).toBe('El Recibo no es tuyo')

        expect(response.status).not.toBe(200)
    })

    it('should download receipt', async () => {
        const response = await request(app)
            .get(`/api/receipts/1`)
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toEqual('application/pdf')

        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
    })
})

describe('GET /api/receipts/:receiptId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .get('/api/receipts/1')
            .set('Authorization', `Bearer ${hackerToken}`)
        expect(response.status).toBe(403)
        expect(response.text).toBe('No autorizado')

        expect(response.status).not.toBe(200)
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .get('/api/receipts/1')
            .set('Authorization', `Bearer ${hackerToken}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('No autorizado')

        expect(response.status).not.toBe(200)
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .get('/api/receipts/asdfasd')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display non existent receipt error', async () => {
        const receiptId = 999
        const response = await request(app)
            .get(`/api/receipts/${receiptId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(404)
        expect(response.text).toBe('El Recibo no Existe')

        expect(response.status).not.toBe(200)
    })

    it('should display not your receipt error if user', async () => {
        const response = await request(app)
            .get(`/api/receipts/1`)
            .set('Authorization', `Bearer ${tokenUser2}`)

        expect(response.status).toBe(409)
        expect(response.text).toBe('El Recibo no es tuyo')

        expect(response.status).not.toBe(200)
    })

    it('should download receipt', async () => {
        const response = await request(app)
            .get(`/api/receipts/1`)
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toEqual('application/pdf')

        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
    })
})

describe('GET /api/receipts/user/:userId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .get('/api/receipts/user/1')
            .set('Authorization', `Bearer ${hackerToken}`)
        expect(response.status).toBe(403)
        expect(response.text).toBe('No autorizado')

        expect(response.status).not.toBe(200)
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .get('/api/receipts/user/1')
            .set('Authorization', `Bearer ${hackerToken}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('No autorizado')

        expect(response.status).not.toBe(200)
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .get('/api/receipts/user/asdf')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display non existent user error', async () => {
        const userId = 999
        const response = await request(app)
            .get(`/api/receipts/user/${userId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(404)
        expect(response.text).toBe('Usuario No Existe')

        expect(response.status).not.toBe(200)
    })

    it('should display not your receipts error if user', async () => {
        const response = await request(app)
            .get(`/api/receipts/user/1`)
            .set('Authorization', `Bearer ${tokenUser2}`)

        expect(response.status).toBe(409)
        expect(response.text).toBe('Los Recibos no son tuyos')

        expect(response.status).not.toBe(200)
    })

    it('should show receipts', async () => {
        const response = await request(app)
            .get(`/api/receipts/user/1`)
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')

        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
    })
})

describe('DELETE /api/receipts/:receiptId', () => {
    it('should display validationToken errors', async () => {
        const response = await request(app)
            .delete('/api/receipts/1')
            .set('Authorization', `Bearer asdfasdf`)
        expect(response.status).toBe(403)
        expect(response.text).toBe('Token no valido')

        expect(response.status).not.toBe(200)
    })

    it('should display unauthorized errors', async () => {
        const response = await request(app)
            .delete('/api/receipts/1')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(response.status).toBe(403)
        expect(response.text).toBe('Solo administradores estan autorizados')

        expect(response.status).not.toBe(200)
    })

    it('should display express-validator errors', async () => {
        const response = await request(app)
            .delete('/api/receipts/asdfasd')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    it('should display non existent receipt error', async () => {
        const receiptId = 999
        const response = await request(app)
            .delete(`/api/receipts/${receiptId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(404)
        expect(response.text).toBe('El Recibo no Existe')

        expect(response.status).not.toBe(200)
    })

    it('should delete receipt', async () => {
        const response = await request(app)
            .delete(`/api/receipts/1`)
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(200)
        expect(response.text).toBe('Recibo eliminado correctamente')

        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(409)
    })
})