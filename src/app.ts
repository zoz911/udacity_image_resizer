import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import indexRouter from './routes/index';
import multerConfig from './multerConfig';
import { resizeImage } from './utils/imageProcessing';

const app = express();
const PORT = 3000;

const uploadsDir = path.join(__dirname, '../uploads');
const resizedDir = path.join(__dirname, '../resized');

// Ensure directory exists
const ensureDirExists = async (dir: string): Promise<void> => {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (err) {
        console.error(`Error creating directory ${dir}: ${err}`);
    }
};

ensureDirExists(uploadsDir);
ensureDirExists(resizedDir);

// CORS Configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// JSON Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.get('/', (req: Request, res: Response): void => {
    res.status(200).send('Welcome to the Image Processing API');
});

app.get('/api/gallery', async (req: Request, res: Response): Promise<void> => {
    try {
        const images = await getImagesFromDirectory(resizedDir);
        res.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.post('/upload', multerConfig.single('image'), (req: Request, res: Response): void => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

// Server-side resize
app.post('/api/resize', multerConfig.single('image'), async (req: Request, res: Response): Promise<void> => {
    const { width, height } = req.body;
    const { file } = req;

    if (!file) {
        res.status(400).json({ error: 'Image file is required' });
        return;
    }

    const inputFile = path.join(uploadsDir, file.filename);
    const outputFile = path.join(resizedDir, file.filename);

    console.log(`Resizing image: input=${inputFile}, output=${outputFile}, width=${width}, height=${height}`);

    try {
        const outputFilename = await resizeImage(inputFile, outputFile, parseInt(width, 10), parseInt(height, 10));
        res.json({ filename: outputFilename, width, height });
    } catch (error) {
        console.error('Error resizing image:', error);
        res.status(500).json({ error: 'Failed to resize image' });
    }
});

app.get('/resized/:filename', async (req: Request, res: Response): Promise<void> => {
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

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, (): void => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;

const getImagesFromDirectory = async (dir: string): Promise<{ filename: string, path: string }[]> => {
    try {
        const files = await fs.readdir(dir);
        return files.map(file => ({ filename: file, path: path.join('resized', file) }));
    } catch (err) {
        console.error(`Error reading directory ${dir}: ${err}`);
        return [];
    }
};