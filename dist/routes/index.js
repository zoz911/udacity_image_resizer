"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const imageProcessing_1 = require("../utils/imageProcessing");
const multerConfig_1 = __importDefault(require("../multerConfig"));
const router = express_1.default.Router();
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
const resizedDir = path_1.default.join(__dirname, '../../resized');
// Ensure directories exist
promises_1.default.mkdir(uploadsDir, { recursive: true }).catch(console.error);
promises_1.default.mkdir(resizedDir, { recursive: true }).catch(console.error);
// Endpoint to handle image resizing
router.post('/resize', multerConfig_1.default.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const width = parseInt(req.body.width);
    const height = parseInt(req.body.height);
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return res.status(400).json({ error: 'Valid width and height parameters are required.' });
    }
    const originalFilename = path_1.default.parse(req.file.originalname).name;
    const outputPath = path_1.default.join(resizedDir, `${originalFilename}.jpg`);
    try {
        const resizedFilename = await (0, imageProcessing_1.resizeImage)(req.file.path, outputPath, width, height);
        const resizedImagePath = `/resized/${resizedFilename}`;
        res.status(200).json({ message: 'Image resized successfully.', resizedImagePath });
    }
    catch (error) {
        console.error(`Error resizing image: ${error}`);
        res.status(500).json({ error: 'Error resizing image.' });
    }
});
router.post('/upload', multerConfig_1.default.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: 'Image uploaded successfully.', imageUrl });
});
// gellery 
router.get('/gallery', async (req, res) => {
    try {
        const files = await promises_1.default.readdir(resizedDir);
        if (files.length === 0) {
            return res.status(200).json([]);
        }
        const images = files.map(file => {
            const { name, ext } = path_1.default.parse(file);
            const [filename, dimensions] = name.split('-');
            const [width, height] = dimensions.split('x').map(num => parseInt(num));
            return {
                path: path_1.default.join('resized', file),
                filename: file,
                width,
                height
            };
        });
        const lastResizedImage = images.sort((a, b) => {
            return b.filename.localeCompare(a.filename);
        })[0];
        res.status(200).json({ gallery: images, lastResizedImage });
    }
    catch (error) {
        console.error(`Error fetching gallery: ${error}`);
        res.status(500).json({ error: 'Error fetching gallery.' });
    }
});
router.get('/images', async (req, res) => {
    const { filename, width, height } = req.query;
    if (!filename) {
        return res.status(400).json({ error: 'Filename is required.' });
    }
    const inputPath = path_1.default.join(uploadsDir, `${filename}.jpg`);
    try {
        await promises_1.default.access(inputPath);
    }
    catch (error) {
        return res.status(404).json({ error: 'File not found.' });
    }
    if (!width || !height) {
        return res.sendFile(inputPath);
    }
    const parsedWidth = parseInt(width);
    const parsedHeight = parseInt(height);
    if (isNaN(parsedWidth) || isNaN(parsedHeight) || parsedWidth <= 0 || parsedHeight <= 0) {
        return res.status(400).json({ error: 'Valid width and height parameters are required.' });
    }
    const outputPath = path_1.default.join(resizedDir, `${filename}-${parsedWidth}x${parsedHeight}.jpg`);
    try {
        await (0, imageProcessing_1.resizeImage)(inputPath, outputPath, parsedWidth, parsedHeight);
        res.sendFile(outputPath);
    }
    catch (error) {
        console.error(`Error resizing image: ${error}`);
        res.status(500).json({ error: 'Error resizing image.' });
    }
});
exports.default = router;
