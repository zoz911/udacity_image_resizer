"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const request = (0, supertest_1.default)(app_1.default);
let server;
const validTestImagePath = path_1.default.resolve(__dirname, '../../uploads/foo.jpg');
beforeAll(async () => {
    const uploadsDir = path_1.default.resolve('uploads');
    const testFilePath = path_1.default.join(uploadsDir, 'test.jpg');
    await fs_1.promises.mkdir(uploadsDir, { recursive: true });
    const validImageBuffer = await fs_1.promises.readFile(validTestImagePath);
    await fs_1.promises.writeFile(testFilePath, validImageBuffer);
    server = app_1.default.listen(3001); // Start server on a different port for testing
});
afterAll(async () => {
    const testFilePath = path_1.default.join(path_1.default.resolve('uploads'), 'test.jpg');
    await fs_1.promises.unlink(testFilePath).catch(() => { });
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
            .attach('image', path_1.default.resolve('uploads/test.jpg'));
        expect(response.status).toBe(200);
    });
    it('should resize an uploaded image', async () => {
        const response = await request.get('/api/images?filename=test&width=200&height=200');
        expect(response.status).toBe(200);
    });
});
