"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const imageProcessing_1 = require("../utils/imageProcessing");
router.post('/resize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { imagePath, width, height } = req.body;
    try {
        yield (0, imageProcessing_1.resizeImage)(imagePath, `resized-${imagePath}`, width, height);
        res.send(`Image resized succesfully !!`);
    }
    catch (err) {
        console.error(err);
        res.status(500).send(`Error when resizing ):`);
    }
}));
router.get('/', (req, res) => {
    res.send('hello world');
});
// Example usage in your Express route
const express = require('express');
const router = express.Router();
const upload = require('../path/to/multerConfig'); // Adjust the path based on your project structure
const { resizeImage } = require('../utils/imageProcessing');

// Example POST route for file upload
router.post('/api/upload', upload.single('imageFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        
        const imagePath = req.file.path;
        const { width, height } = req.body;

        // Process the uploaded image
        await resizeImage(imagePath, width, height);

        // Return success response
        res.status(200).send('Image uploaded and resized successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error when uploading or resizing image');
    }
});

module.exports = router;

exports.default = router;
