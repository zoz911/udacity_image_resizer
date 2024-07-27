"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizeImage = resizeImage;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
async function resizeImage(inputPath, outputPath, width, height) {
    const parsedPath = path_1.default.parse(outputPath);
    const outputFilename = `${parsedPath.name}-${width}x${height}${parsedPath.ext}`;
    const outputPathWithDimensions = path_1.default.join(parsedPath.dir, outputFilename);
    await (0, sharp_1.default)(inputPath)
        .resize(width, height)
        .toFile(outputPathWithDimensions);
    return outputFilename;
}
