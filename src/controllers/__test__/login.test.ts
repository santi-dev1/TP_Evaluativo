import request from 'supertest';
import dotenv from 'dotenv'
import app from '../../server';
import db from '../../config/db';

dotenv.config()
let tokenAdmin : string
let tokenUser : string

beforeAll(async () => {
    await db.authenticate();
    await db.sync();

});

afterAll(async () => {
    await db.close();
});

describe('POST /api/auth/login', () => {
    it('should display express-validator errors', async () => {
        const response = await request(app)
            .post(`/api/auth/login`)
            .send({})


        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.status).not.toBe(200)
    })

    it('should display wrong email or password (email)', async () => {
        const response = await request(app)
            .post(`/api/auth/login`)
            .send({
                email: 'asdf@asdf.com',
                password: 'superadmin'
            })


        expect(response.status).toBe(401)
        expect(response.text).toBe('Correo o Contraseña incorrectos')

        expect(response.status).not.toBe(200)
    })

    it('should display wrong email or password (password)', async () => {
        const response = await request(app)
            .post(`/api/auth/login`)
            .send({
                email: 'super@super.com',
                password: 'asdfasdf1'
            })


        expect(response.status).toBe(401)
        expect(response.text).toBe('Correo o Contraseña incorrectos')

        expect(response.status).not.toBe(200)
    })

    it('should login you to the app', async () => {
        const response = await request(app)
            .post(`/api/auth/login`)
            .send({
                email: 'super@super.com',
                password: 'superadmin'
            })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('token')

        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(400)
        expect(response.body).not.toHaveProperty('errors')
        expect(response.text).not.toBe('Correo o Contraseña incorrectos')
    })
})