import { NextRequest, NextResponse } from 'next/server';
import { saveAssetFile } from '@/lib/asset-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string || 'default';
    const type = formData.get('type') as 'video' | 'audio' | 'image';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to persistent storage
    const { assetId, relativePath } = await saveAssetFile(
      buffer,
      file.name,
      projectId
    );

    // Extract metadata (this will be done on client side for browser APIs)
    // Server-side metadata extraction would require different approach

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        name: file.name,
        type,
        url: relativePath,
        relativePath,
        size: file.size,
        missing: false,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
