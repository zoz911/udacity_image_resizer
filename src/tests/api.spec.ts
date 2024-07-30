import supertest from 'supertest';
import app from '../app';
import path from 'path';
import { promises as fs } from 'fs';
import http from 'http';

const request = supertest(app);
let server: http.Server;
const uploadsDir = path.resolve('uploads');
const testFilePath = path.join(uploadsDir, 'test.jpg');
const validTestImagePath = path.resolve(__dirname, '../../uploads/foo.jpg');

beforeAll(async () => {
    await fs.mkdir(uploadsDir, { recursive: true });
    const validImageBuffer = await fs.readFile(validTestImagePath);
    await fs.writeFile(testFilePath, validImageBuffer);

    server = app.listen(3001); 
});

afterAll(async () => {
    const resizedDir = path.resolve('resized');
    const resizedFilePath = path.join(resizedDir, 'test-1000x1000-1000x1000.jpg');
    
    await fs.unlink(testFilePath).catch(() => { /* ignore */ });
    await fs.unlink(resizedFilePath).catch(() => { /* ignore */ });

    // Close the server correctly
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

    it('GET /api/images?filename=test&width=1000&height=1000 should return 200 OK', async () => {
        const response = await request.get('/api/images?filename=test&width=1000&height=1000');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('image/jpeg');
    });

    it('GET /api/images?filename=test&width=-1000&height=1000 should return 400 Bad Request', async () => {
        const response = await request.get('/api/images?filename=test&width=-1000&height=1000');
        expect(response.status).toBe(400);
    });

    it('GET /api/images should return 400 Bad Request', async () => {
        const response = await request.get('/api/images');
        expect(response.status).toBe(400);
    });
});

describe('Image Processing API', () => {

    it('should resize an uploaded image', async () => {
        const response = await request.get('/api/images?filename=test&width=1000&height=1000');
        expect(response.status).toBe(200);

        const resizedFilePath = path.join(path.resolve('resized'), 'test-1000x1000-1000x1000.jpg');
        const fileExists = await fs.access(resizedFilePath).then(() => true).catch(() => false);
        expect(fileExists).toBe(true);
    });
});
