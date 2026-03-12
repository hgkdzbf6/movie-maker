/**
 * Asset storage utilities for persistent file storage
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Storage configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Ensure upload directory exists
 */
export function ensureUploadDir(projectId?: string): string {
  const dir = projectId ? path.join(UPLOAD_DIR, projectId) : UPLOAD_DIR;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dir;
}

/**
 * Save uploaded file to persistent storage
 */
export async function saveAssetFile(
  file: Buffer,
  originalName: string,
  projectId: string
): Promise<{ assetId: string; relativePath: string; absolutePath: string }> {
  const assetId = randomUUID();
  const ext = path.extname(originalName);
  const filename = `${assetId}${ext}`;

  const uploadDir = ensureUploadDir(projectId);
  const absolutePath = path.join(uploadDir, filename);
  const relativePath = `/uploads/${projectId}/${filename}`;

  // Write file to disk
  fs.writeFileSync(absolutePath, file);

  return {
    assetId,
    relativePath,
    absolutePath,
  };
}

/**
 * Check if asset file exists
 */
export function assetFileExists(relativePath: string): boolean {
  const absolutePath = path.join(process.cwd(), 'public', relativePath);
  return fs.existsSync(absolutePath);
}

/**
 * Delete asset file
 */
export function deleteAssetFile(relativePath: string): boolean {
  try {
    const absolutePath = path.join(process.cwd(), 'public', relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to delete asset file:', error);
    return false;
  }
}

/**
 * Clean up project assets (delete all files in project directory)
 */
export function cleanupProjectAssets(projectId: string): void {
  const projectDir = path.join(UPLOAD_DIR, projectId);

  if (fs.existsSync(projectDir)) {
    const files = fs.readdirSync(projectDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(projectDir, file));
    });
    fs.rmdirSync(projectDir);
  }
}

/**
 * Get asset file info
 */
export function getAssetFileInfo(relativePath: string): {
  exists: boolean;
  size?: number;
  absolutePath?: string;
} {
  const absolutePath = path.join(process.cwd(), 'public', relativePath);

  if (!fs.existsSync(absolutePath)) {
    return { exists: false };
  }

  const stats = fs.statSync(absolutePath);

  return {
    exists: true,
    size: stats.size,
    absolutePath,
  };
}
