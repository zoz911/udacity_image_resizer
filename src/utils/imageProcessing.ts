import sharp from 'sharp';
import path from 'path';

export async function resizeImage(
  inputPath: string,
  outputPath: string,
  width: number,
  height: number
): Promise<void> {
  await sharp(inputPath)
    .resize(width, height)
    .toFile(outputPath);
}
