import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { resizeImage } from '../utils/imageProcessing';
import upload from '../multerConfig';

const router = express.Router();
const uploadsDir = path.join(__dirname, '../../uploads');
const resizedDir = path.join(__dirname, '../../resized');

// Ensure directories exist
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);
fs.mkdir(resizedDir, { recursive: true }).catch(console.error);

// Endpoint to handle image resizing
router.post('/resize', upload.single('image'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const width = parseInt(req.body.width);
    const height = parseInt(req.body.height);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return res.status(400).json({ error: 'Valid width and height parameters are required.' });
    }

    const originalFilename = path.parse(req.file.originalname).name;
    const resizedFilename = `${originalFilename}-${width}x${height}.jpg`;
    const outputPath = path.join(resizedDir, resizedFilename);

    try {
        // Check if the resized image already exists
        try {
            await fs.access(outputPath);
            return res.status(400).json({ error: 'Image already resized with these dimensions.' });
        } catch {}

        await resizeImage(req.file.path, outputPath, width, height);
        const resizedImagePath = `/resized/${resizedFilename}`;
        res.status(200).json({ message: 'Image resized successfully.', resizedImagePath });
    } catch (error) {
        console.error(`Error resizing image: ${error}`);
        res.status(500).json({ error: 'Error resizing image.' });
    }
});

router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: 'Image uploaded successfully.', imageUrl });
});

router.get('/gallery', async (req: Request, res: Response) => {
    try {
        const files = await fs.readdir(resizedDir);
        if (files.length === 0) {
            return res.status(200).json([]);
        }

        const images = files.map(file => {
            const { name } = path.parse(file);
            const [filename, dimensions] = name.split('-');
            const [width, height] = dimensions.split('x').map(num => parseInt(num));
            return {
                path: path.join('resized', file),
                filename: file,
                width,
                height
            };
        });

        const lastResizedImage = images.sort((a, b) => b.filename.localeCompare(a.filename))[0];

        res.status(200).json({ gallery: images, lastResizedImage });
    } catch (error) {
        console.error(`Error fetching gallery: ${error}`);
        res.status(500).json({ error: 'Error fetching gallery.' });
    }
});

router.get('/images', async (req: Request, res: Response) => {
    const { filename, width, height } = req.query;

    if (!filename) {
        return res.status(400).json({ error: 'Filename is required.' });
    }

    const inputPath = path.join(uploadsDir, `${filename}.jpg`);

    try {
        await fs.access(inputPath);
    } catch (error) {
        return res.status(404).json({ error: 'File not found.' });
    }

    if (!width || !height) {
        return res.sendFile(inputPath);
    }

    const parsedWidth = parseInt(width as string);
    const parsedHeight = parseInt(height as string);

    if (isNaN(parsedWidth) || isNaN(parsedHeight) || parsedWidth <= 0 || parsedHeight <= 0) {
        return res.status(400).json({ error: 'Valid width and height parameters are required.' });
    }

    const resizedFilename = `${filename}-${parsedWidth}x${parsedHeight}.jpg`;
    const outputPath = path.join(resizedDir, resizedFilename);

    try {
        // Check if the resized image already exists
        try {
            await fs.access(outputPath);
        } catch {
            await resizeImage(inputPath, outputPath, parsedWidth, parsedHeight);
        }
        res.sendFile(outputPath);
    } catch (error) {
        console.error(`Error resizing image: ${error}`);
        res.status(500).json({ error: 'Error resizing image.' });
    }
});

export default router;
