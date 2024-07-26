"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizeImage = resizeImage;
const sharp_1 = __importDefault(require("sharp"));
async function resizeImage(inputPath, outputPath, width, height) {
    await (0, sharp_1.default)(inputPath)
        .resize(width, height)
        .toFile(outputPath);
}
