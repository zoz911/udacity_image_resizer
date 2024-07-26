"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app")); // Ensure this imports your Express app correctly
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const request = (0, supertest_1.default)(app_1.default);
const testImagePath = path_1.default.resolve('assets');
const testFile = 'test'; // Ensure 'test.jpg' exists in the 'assets' directory
const testWidth = 200;
const testHeight = 400;
const testResizedPath = path_1.default.resolve('resized');
const testResizedImage = path_1.default.join(testResizedPath, `${testFile}-${testWidth}_${testHeight}.jpg`);
describe('Image Processing API', () => {
    it('should upload an image', async () => {
        const response = await request
            .post('/api/upload')
            .attach('image', path_1.default.join(testImagePath, 'test.jpg'));
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Image uploaded successfully.');
        expect(response.body.imageUrl).toBe(`/uploads/test.jpg`);
    });
    it('should resize an uploaded image', async () => {
        const response = await request
            .post('/api/resize')
            .attach('image', path_1.default.join(testImagePath, 'test.jpg'))
            .field('width', testWidth)
            .field('height', testHeight);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Image resized successfully.');
        expect(response.body.resizedImagePath).toBe(`/resized/${testFile}-${testWidth}_${testHeight}.jpg`);
    });
    it('should return error for missing file during resize', async () => {
        const response = await request
            .post('/api/resize')
            .field('width', testWidth)
            .field('height', testHeight);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No file uploaded.');
    });
    it('should return error for missing dimensions during resize', async () => {
        const response = await request
            .post('/api/resize')
            .attach('image', path_1.default.join(testImagePath, 'test.jpg'));
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Valid width and height parameters are required.');
    });
    it('should return error for invalid dimensions during resize', async () => {
        const response = await request
            .post('/api/resize')
            .attach('image', path_1.default.join(testImagePath, 'test.jpg'))
            .field('width', -1)
            .field('height', 'not-a-number');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Valid width and height parameters are required.');
    });
    it('should get gallery of images', async () => {
        const response = await request.get('/api/gallery');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
            expect(response.body[0]).toBeDefined();
            expect(response.body[0].path).toBeDefined();
            expect(response.body[0].filename).toBeDefined();
        }
    });
    afterAll(async () => {
        try {
            await promises_1.default.rm(testResizedImage, { recursive: true, force: true });
        }
        catch (err) {
            console.error(`Error removing test file: ${err}`);
        }
    });
});
