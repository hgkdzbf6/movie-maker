import { NextRequest, NextResponse } from 'next/server';
import { assetFileExists } from '@/lib/asset-storage';

export async function POST(request: NextRequest) {
  try {
    const { assets } = await request.json();

    if (!Array.isArray(assets)) {
      return NextResponse.json(
        { error: 'Invalid assets array' },
        { status: 400 }
      );
    }

    // Check each asset
    const checkedAssets = assets.map(asset => {
      if (asset.relativePath) {
        const exists = assetFileExists(asset.relativePath);
        return {
          ...asset,
          missing: !exists,
        };
      }
      return {
        ...asset,
        missing: false,
      };
    });

    return NextResponse.json({
      success: true,
      assets: checkedAssets,
    });
  } catch (error) {
    console.error('Asset check error:', error);
    return NextResponse.json(
      { error: 'Failed to check assets' },
      { status: 500 }
    );
  }
}
