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
const uploadsDir = path_1.default.resolve('uploads');
const testFilePath = path_1.default.join(uploadsDir, 'test.jpg');
const validTestImagePath = path_1.default.resolve(__dirname, '../../uploads/foo.jpg');
beforeAll(async () => {
    await fs_1.promises.mkdir(uploadsDir, { recursive: true });
    const validImageBuffer = await fs_1.promises.readFile(validTestImagePath);
    await fs_1.promises.writeFile(testFilePath, validImageBuffer);
    server = app_1.default.listen(3001);
});
afterAll(async () => {
    const resizedDir = path_1.default.resolve('resized');
    const resizedFilePath = path_1.default.join(resizedDir, 'test-1000x1000-1000x1000.jpg');
    await fs_1.promises.unlink(testFilePath).catch(() => { });
    await fs_1.promises.unlink(resizedFilePath).catch(() => { });
    // Close the server 
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
        const resizedFilePath = path_1.default.join(path_1.default.resolve('resized'), 'test-1000x1000.jpg');
        const fileExists = await fs_1.promises.access(resizedFilePath).then(() => true).catch(() => false);
        expect(fileExists).toBe(true);
    });
});
