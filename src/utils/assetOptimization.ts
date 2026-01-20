import sharp from 'sharp';
import path from 'path';

export interface ImageOptimizationOptions {
  quality?: number;
  width?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export interface OptimizationResult {
  success: boolean;
  outputPath?: string;
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savedPercentage: number;
  error?: string;
}

export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizationResult> {
  const {
    quality = 80,
    width,
    format = 'webp'
  } = options;

  try {
    const inputBuffer = await sharp(inputPath)
      .resize(width)
      .toFormat(format, { quality })
      .toBuffer();

    const outputBuffer = await sharp(outputPath)
      .toBuffer();

    const originalSize = outputBuffer.length;
    const optimizedSize = inputBuffer.length;
    const savedBytes = originalSize - optimizedSize;
    const savedPercentage = (savedBytes / originalSize) * 100;

    return {
      success: true,
      outputPath,
      originalSize,
      optimizedSize,
      savedBytes,
      savedPercentage: Math.round(savedPercentage * 100) / 100
    };
  } catch (error) {
    return {
      success: false,
      originalSize: 0,
      optimizedSize: 0,
      savedBytes: 0,
      savedPercentage: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function batchOptimizeImages(
  inputDir: string,
  outputDir: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizationResult[]> {
  const fs = await import('fs/promises');
  const results: OptimizationResult[] = [];

  try {
    const files = await fs.readdir(inputDir);
    const imageFiles = files.filter(file =>
      /\.(png|jpg|jpeg|webp)$/i.test(file)
    );

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);

      const result = await optimizeImage(inputPath, outputPath, options);
      results.push(result);
    }

    return results;
  } catch (error) {
    throw new Error(`Batch optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function generateCacheHeaders(maxAge: number = 31536000): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${maxAge}, immutable`,
    'CDN-Cache-Control': `public, max-age=${maxAge}, immutable`
  };
}

export function generateAssetPath(
  assetPath: string,
  cdnBaseUrl: string,
  version?: string
): string {
  const normalizedPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const baseUrl = cdnBaseUrl.endsWith('/') ? cdnBaseUrl.slice(0, -1) : cdnBaseUrl;
  const versionSuffix = version ? `?v=${version}` : '';

  return `${baseUrl}/${normalizedPath}${versionSuffix}`;
}

export function calculateCacheHitRate(
  cachedRequests: number,
  totalRequests: number
): number {
  if (totalRequests === 0) return 0;
  return Math.round((cachedRequests / totalRequests) * 10000) / 100;
}
