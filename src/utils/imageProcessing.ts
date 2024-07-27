import sharp from 'sharp';
import path from 'path';

export async function resizeImage(
  inputPath: string,
  outputPath: string,
  width: number,
  height: number
): Promise<string> {
  const parsedPath = path.parse(outputPath);
  const outputFilename = `${parsedPath.name}-${width}x${height}${parsedPath.ext}`;
  const outputPathWithDimensions = path.join(parsedPath.dir, outputFilename);

  await sharp(inputPath)
    .resize(width, height)
    .toFile(outputPathWithDimensions);

  return outputFilename;
}
