import supertest from 'supertest';
import app from '../app';
import path from 'path';
import { promises as fs } from 'fs';
import http from 'http';

const request = supertest(app);
let server: http.Server;
const validTestImagePath = path.resolve(__dirname, '../../uploads/foo.jpg');

beforeAll(async () => {
    const uploadsDir = path.resolve('uploads');
    const testFilePath = path.join(uploadsDir, 'test.jpg');

    await fs.mkdir(uploadsDir, { recursive: true });
    const validImageBuffer = await fs.readFile(validTestImagePath);
    await fs.writeFile(testFilePath, validImageBuffer);

    server = app.listen(3001); // Start server on a different port for testing
});

afterAll(async () => {
    const testFilePath = path.join(path.resolve('uploads'), 'test.jpg');
    await fs.unlink(testFilePath).catch(() => {  });

    server.close(); 
});

describe('Test API Endpoints', () => {
    it('GET / should return 200 OK', async () => {
        const response = await request.get('/');
        expect(response.status).toBe(200);
    });

    it('GET /api/images?filename=test should return 200 OK', async () => {
        const response = await request.get('/api/images?filename=test');
        expect(response.status).toBe(200);
    });

    it('GET /api/images?filename=test&width=199&height=199 should return 200 OK', async () => {
        const response = await request.get('/api/images?filename=test&width=199&height=199');
        expect(response.status).toBe(200);
    });

    it('GET /api/images?filename=test&width=-200&height=200 should return 400 Bad Request', async () => {
        const response = await request.get('/api/images?filename=test&width=-200&height=200');
        expect(response.status).toBe(400);
    });

    it('GET /api/images should return 400 Bad Request', async () => {
        const response = await request.get('/api/images');
        expect(response.status).toBe(400);
    });
});

describe('Image Processing API', () => {
    it('should upload an image', async () => {
        const response = await request.post('/api/upload')
            .attach('image', path.resolve('uploads/test.jpg'));
        expect(response.status).toBe(200);
    });

    it('should resize an uploaded image', async () => {
        const response = await request.get('/api/images?filename=test&width=200&height=200');
        expect(response.status).toBe(200);
    });
});
