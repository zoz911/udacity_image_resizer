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
const app = (0, express_1.default)();
const PORT = 3000;
// Ensure directories exist
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
// CORS Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
// JSON and URL-encoded Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from uploads and resized directories
app.use('/uploads', express_1.default.static(uploadsDir));
app.use('/resized', express_1.default.static(resizedDir));
// Routes
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Image Processing API');
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
