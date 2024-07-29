"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const imageProcessing_1 = require("../utils/imageProcessing");
const uploadsDir = path_1.default.resolve('uploads');
const resizedDir = path_1.default.resolve('resized');
const testImagePath = path_1.default.join(uploadsDir, 'test.jpg');
const validTestImagePath = path_1.default.resolve(__dirname, '../../uploads/foo.jpg');
beforeAll(async () => {
    await fs_1.promises.mkdir(uploadsDir, { recursive: true });
    // Use a valid image file content
    const validImageBuffer = await fs_1.promises.readFile(validTestImagePath);
    await fs_1.promises.writeFile(testImagePath, validImageBuffer);
});
afterAll(async () => {
    const resizedFilePath = path_1.default.join(resizedDir, 'test-1000x1000-1000x1000.jpg');
    await fs_1.promises.unlink(testImagePath).catch(() => { });
    await fs_1.promises.unlink(resizedFilePath).catch(() => { });
});
describe('Test image processing via sharp', () => {
    it('raises an error (invalid width value)', async () => {
        try {
            await (0, imageProcessing_1.resizeImage)(testImagePath, path_1.default.join(resizedDir, 'output.jpg'), -100, 100);
        }
        catch (error) {
            expect(error).toBeTruthy();
        }
    });
    it('raises an error (filename does not exist)', async () => {
        try {
            await (0, imageProcessing_1.resizeImage)('nonexistent.jpg', path_1.default.join(resizedDir, 'output.jpg'), 100, 100);
        }
        catch (error) {
            expect(error).toBeTruthy();
        }
    });
    it('succeeds to write resized thumb file (existing file, valid size values)', async () => {
        const outputFilename = await (0, imageProcessing_1.resizeImage)(testImagePath, path_1.default.join(resizedDir, 'test.jpg'), 1000, 1000);
        const outputPath = path_1.default.join(resizedDir, outputFilename);
        const fileExists = await fs_1.promises.access(outputPath).then(() => true).catch(() => false);
        expect(fileExists).toBe(true);
    });
});
