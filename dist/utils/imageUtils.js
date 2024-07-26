"use strict";
// utils/imageUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64ToImage = void 0;
const buffer_1 = require("buffer");
const base64ToImage = (base64String) => {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    return buffer_1.Buffer.from(base64Data, 'base64');
};
exports.base64ToImage = base64ToImage;
