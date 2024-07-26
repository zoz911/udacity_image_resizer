import { promises as fs } from 'fs';
import path from 'path';
import { resizeImage } from '../utils/imageProcessing';

const uploadsDir = path.resolve('uploads');
const resizedDir = path.resolve('resized');
const testImagePath = path.join(uploadsDir, 'test.jpg');
const validTestImagePath = path.resolve(__dirname, '../../uploads/test.jpg');

beforeAll(async () => {
    await fs.mkdir(uploadsDir, { recursive: true });

    // Use a valid image file content
    const validImageBuffer = await fs.readFile(validTestImagePath);
    await fs.writeFile(testImagePath, validImageBuffer);
});

afterAll(async () => {
    const resizedFilePath = path.join(resizedDir, 'test-199_199.jpg');

    await fs.unlink(testImagePath).catch(() => { /* ignore */ });
    await fs.unlink(resizedFilePath).catch(() => { /* ignore */ });
});

describe('Test image processing via sharp', () => {
    it('raises an error (invalid width value)', async () => {
        try {
            await resizeImage(testImagePath, 'output.jpg', -100, 100);
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('raises an error (filename does not exist)', async () => {
        try {
            await resizeImage('nonexistent.jpg', 'output.jpg', 100, 100);
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('succeeds to write resized thumb file (existing file, valid size values)', async () => {
        await resizeImage(testImagePath, path.join(resizedDir, 'test-199_199.jpg'), 199, 199);
        const fileExists = await fs.access(path.join(resizedDir, 'test-199_199.jpg')).then(() => true).catch(() => false);
        expect(fileExists).toBe(true);
    });
});
