"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Storage configuration for multer
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, '../uploads')); // Absolute path for destination folder
    },
    filename: function (req, file, cb) {
        const originalName = path_1.default.parse(file.originalname).name;
        const ext = path_1.default.extname(file.originalname); // Extract file extension
        cb(null, `${originalName}${ext}`); // Use original filename with its extension
    }
});
const upload = (0, multer_1.default)({ storage: storage });
exports.default = upload;
