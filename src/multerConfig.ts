import multer from 'multer';
import path from 'path';

// Storage configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); // Absolute path for destination folder
    },
    filename: function (req, file, cb) {
        const originalName = path.parse(file.originalname).name;
        const ext = path.extname(file.originalname); // Extract file extension
        cb(null, `${originalName}${ext}`); // Use original filename with its extension
    }
});

const upload = multer({ storage: storage });

export default upload;
