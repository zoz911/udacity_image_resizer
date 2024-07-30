import { promises as fs } from 'fs';
import path from 'path';
import { resizeImage } from '../utils/imageProcessing';

const uploadsDir = path.resolve('uploads');
const resizedDir = path.resolve('resized');
const testImagePath = path.join(uploadsDir, 'test.jpg');
const validTestImagePath = path.resolve(__dirname, '../../uploads/foo.jpg');

beforeAll(async () => {
    await fs.mkdir(uploadsDir, { recursive: true });

    // Use a valid image file content
    const validImageBuffer = await fs.readFile(validTestImagePath);
    await fs.writeFile(testImagePath, validImageBuffer);
});

afterAll(async () => {
    const resizedFilePath = path.join(resizedDir, 'test-1000x1000-1000x1000.jpg');

    await fs.unlink(testImagePath).catch(() => { /* ignore */ });
    await fs.unlink(resizedFilePath).catch(() => { /* ignore */ });
});

describe('Test image processing via sharp', () => {
    it('raises an error (invalid width value)', async () => {
        try {
            await resizeImage(testImagePath, path.join(resizedDir, 'output.jpg'), -100, 100);
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('raises an error (filename does not exist)', async () => {
        try {
            await resizeImage('nonexistent.jpg', path.join(resizedDir, 'output.jpg'), 100, 100);
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('succeeds to write resized thumb file (existing file, valid size values)', async () => {
        const outputFilename = await resizeImage(testImagePath, path.join(resizedDir, 'test.jpg'), 1000, 1000);
        const outputPath = path.join(resizedDir, outputFilename);
        const fileExists = await fs.access(outputPath).then(() => true).catch(() => false);
        expect(fileExists).toBe(true);
    });
});
