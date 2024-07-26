"use strict";
const supertest = require('supertest');
const app = require('../app'); // Adjust the import according to the output path
const request = supertest(app);
describe('Image Processing API', () => {
    it('should upload an image', async () => {
        const response = await request
            .post('/api/upload')
            .attach('image', 'assets/test.jpg'); // Adjust the path to your test image
        expect(response.status).toEqual(200);
        expect(response.body.message).toBe('Image uploaded successfully.');
    });
    it('should resize an uploaded image', async () => {
        const response = await request
            .post('/api/resize')
            .attach('image', 'assets/test.jpg') // Adjust the path to your test image
            .field('width', 200)
            .field('height', 400);
        expect(response.status).toEqual(200);
        expect(response.body.message).toBe('Image resized successfully.');
        expect(response.body.resizedImagePath).toBe('/resized/test-200_400.jpg');
    });
});
