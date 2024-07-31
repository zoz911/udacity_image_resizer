
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

class File {
  static imagesThumbPath = path.resolve('uploads/thumbnails');

  static async createThumb({ filename, width, height }: { filename: string; width: string; height: string }): Promise<string | null> {
    const inputPath = path.resolve('uploads', `${filename}.jpg`);
    const outputPath = path.resolve(this.imagesThumbPath, `${filename}-${width}x${height}.jpg`);

    try {
      await sharp(inputPath)
        .resize(parseInt(width, 10), parseInt(height, 10))
        .toFile(outputPath);

      return null; 
    } catch (error) {
      return 'Error processing image';
    }
  }
}

export default File;
