/**
 * 素材管理 API 路由
 * GET    /api/assets           - 获取素材列表
 * POST   /api/assets/upload    - 上传素材
 */

import { NextRequest, NextResponse } from 'next/server';
import { Asset } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// 获取素材列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let assets;

    if (type) {
      assets = Asset.findByType(type as 'video' | 'image' | 'audio', page, limit);
    } else if (search) {
      assets = Asset.search(search, page, limit);
    } else if (projectId) {
      assets = Asset.findByProjectId(projectId, page, limit);
    } else {
      return NextResponse.json(
        { error: '缺少查询参数' },
        { status: 400 }
      );
    }

    return NextResponse.json(assets);
  } catch (error: any) {
    console.error('获取素材列表失败:', error);
    return NextResponse.json(
      { error: '获取素材列表失败' },
      { status: 500 }
    );
  }
}

// 上传素材
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: '无效的令牌' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '缺少文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const validTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mp3',
      'audio/wav',
      'audio/mpeg',
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大 100MB）
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过 100MB' },
        { status: 400 }
      );
    }

    // 确定文件类型
    let assetType: 'video' | 'image' | 'audio';
    if (file.type.startsWith('video')) {
      assetType = 'video';
    } else if (file.type.startsWith('image')) {
      assetType = 'image';
    } else if (file.type.startsWith('audio')) {
      assetType = 'audio';
    } else {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 保存文件
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const fileExtension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    const url = `/uploads/${fileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 提取文件信息
    const assetData: any = {
      projectId: formData.get('projectId') as string || undefined,
      name: file.name,
      type: assetType,
      url,
    };

    // TODO: 提取视频/音频元数据（时长、分辨率等）
    // 这里需要使用 FFmpeg 或其他工具提取元数据

    // 如果是视频或音频，提取时长
    if (assetType === 'video' || assetType === 'audio') {
      // 暂时设置默认时长
      assetData.duration = 5;
    }

    // 如果是图片或视频，提取分辨率
    if (assetType === 'image' || assetType === 'video') {
      // 暂时设置默认分辨率
      assetData.width = 1920;
      assetData.height = 1080;
    }

    const asset = Asset.create(assetData);

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    console.error('上传素材失败:', error);
    return NextResponse.json(
      { error: '上传素材失败' },
      { status: 500 }
    );
  }
}
