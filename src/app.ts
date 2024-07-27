import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import indexRouter from './routes/index';
import multerConfig from './multerConfig';
import { resizeImage } from './utils/imageProcessing';

const app = express();
const PORT = 3000;

// Ensure directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const resizedDir = path.join(__dirname, '../resized');

const ensureDirExists = async (dir: string) => {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (err) {
        console.error(`Error creating directory ${dir}: ${err}`);
    }
};

ensureDirExists(uploadsDir);
ensureDirExists(resizedDir);

// CORS Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// JSON and URL-encoded Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads and resized directories
app.use('/uploads', express.static(uploadsDir));

// Routes
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to the Image Processing API');
});

app.get('/api/gallery', async (req, res) => {
    try {
        const images = await getImagesFromDirectory(resizedDir);
        res.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.post('/upload', multerConfig.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

// Server-side resize endpoint
app.post('/api/resize', multerConfig.single('image'), async (req: Request, res: Response) => {
    const { width, height } = req.body;
    const { file } = req;

    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    const inputFile = path.join(uploadsDir, file.filename);
    const outputFile = path.join(resizedDir, file.filename);

    console.log(`Resizing image: input=${inputFile}, output=${outputFile}, width=${width}, height=${height}`);

    try {
        const outputFilename = await resizeImage(inputFile, outputFile, parseInt(width), parseInt(height));
        res.json({ filename: outputFilename, width, height });
    } catch (error) {
        console.error('Error resizing image:', error);
        res.status(500).json({ error: 'Failed to resize image' });
    }
});

// Dynamic route to serve resized images
app.get('/resized/:filename', async (req: Request, res: Response) => {
    const { filename } = req.params;
    const decodedFilename = decodeURIComponent(filename);
    const filePath = path.join(resizedDir, decodedFilename);

    try {
        await fs.access(filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error(`Error serving file ${filePath}: ${error}`);
        res.status(404).json({ error: 'File not found' });
    }
});

app.use('/api', indexRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;

// Utility function to get images from the directory
const getImagesFromDirectory = async (dir: string) => {
    try {
        const files = await fs.readdir(dir);
        return files.map(file => ({ filename: file, path: path.join('resized', file) }));
    } catch (err) {
        console.error(`Error reading directory ${dir}: ${err}`);
        return [];
    }
};