import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import indexRouter from './routes/index';

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
app.use('/resized', express.static(resizedDir));

// Routes
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to the Image Processing API');
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
