"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
class File {
    static imagesThumbPath = path_1.default.resolve('uploads/thumbnails');
    static async createThumb({ filename, width, height }) {
        const inputPath = path_1.default.resolve('uploads', `${filename}.jpg`);
        const outputPath = path_1.default.resolve(this.imagesThumbPath, `${filename}-${width}x${height}.jpg`);
        try {
            await (0, sharp_1.default)(inputPath)
                .resize(parseInt(width, 10), parseInt(height, 10))
                .toFile(outputPath);
            return null;
        }
        catch (error) {
            return 'Error processing image';
        }
    }
}
exports.default = File;
