"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const index_1 = __importDefault(require("./routes/index"));
const multerConfig_1 = __importDefault(require("./multerConfig"));
const imageProcessing_1 = require("./utils/imageProcessing");
const app = (0, express_1.default)();
const PORT = 3000;
const uploadsDir = path_1.default.join(__dirname, '../uploads');
const resizedDir = path_1.default.join(__dirname, '../resized');
const ensureDirExists = async (dir) => {
    try {
        await promises_1.default.mkdir(dir, { recursive: true });
    }
    catch (err) {
        console.error(`Error creating directory ${dir}: ${err}`);
    }
};
ensureDirExists(uploadsDir);
ensureDirExists(resizedDir);
// CORS 
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
// JSON Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from uploads and resized directories
app.use('/uploads', express_1.default.static(uploadsDir));
// Routes
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Image Processing API');
});
app.get('/api/gallery', async (req, res) => {
    try {
        const images = await getImagesFromDirectory(resizedDir);
        res.json(images);
    }
    catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});
app.post('/upload', multerConfig_1.default.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});
// Server-side resize endpoint
app.post('/api/resize', multerConfig_1.default.single('image'), async (req, res) => {
    const { width, height } = req.body;
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }
    const inputFile = path_1.default.join(uploadsDir, file.filename);
    const outputFile = path_1.default.join(resizedDir, file.filename);
    console.log(`Resizing image: input=${inputFile}, output=${outputFile}, width=${width}, height=${height}`);
    try {
        const outputFilename = await (0, imageProcessing_1.resizeImage)(inputFile, outputFile, parseInt(width), parseInt(height));
        res.json({ filename: outputFilename, width, height });
    }
    catch (error) {
        console.error('Error resizing image:', error);
        res.status(500).json({ error: 'Failed to resize image' });
    }
});
// Dynamic route to serve resized images
app.get('/resized/:filename', async (req, res) => {
    const { filename } = req.params;
    const decodedFilename = decodeURIComponent(filename);
    const filePath = path_1.default.join(resizedDir, decodedFilename);
    try {
        await promises_1.default.access(filePath);
        res.sendFile(filePath);
    }
    catch (error) {
        console.error(`Error serving file ${filePath}: ${error}`);
        res.status(404).json({ error: 'File not found' });
    }
});
app.use('/api', index_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
exports.default = app;
// Utility function to get images from the directory
const getImagesFromDirectory = async (dir) => {
    try {
        const files = await promises_1.default.readdir(dir);
        return files.map(file => ({ filename: file, path: path_1.default.join('resized', file) }));
    }
    catch (err) {
        console.error(`Error reading directory ${dir}: ${err}`);
        return [];
    }
};
