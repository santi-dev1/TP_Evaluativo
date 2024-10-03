import request from 'supertest';
import app from '../server';
import db from '../config/db';

beforeAll(async () => {
    await db.authenticate();
    await db.sync();
});

afterAll(async () => {
    await db.close();
});

describe('GET /api', () => {
    


    it('should send back a json response', async () => {
        const res = await request(app).get('/api');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.status).not.toBe(404)
        expect(res.body.msg).not.toBe('No Desde Api')
    });
});
