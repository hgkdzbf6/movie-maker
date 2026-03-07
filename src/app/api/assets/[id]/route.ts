/**
 * 获取素材详情 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { Asset } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    const assetId = params.id;

    // 验证必填字段
    if (!assetId) {
      return NextResponse.json({ error: '素材 ID 不能为空' }, { status: 400 });
    }

    // 获取素材
    const asset = Asset.findById(assetId);

    if (!asset) {
      return NextResponse.json({ error: '素材不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error('获取素材详情失败:', error);
    return NextResponse.json(
      { error: '获取素材详情失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新素材 API
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 获取请求数据
    const data = await request.json();
    const assetId = params.id;

    // 验证必填字段
    if (!assetId) {
      return NextResponse.json({ error: '素材 ID 不能为空' }, { status: 400 });
    }

    // 更新素材
    const updatedAsset = Asset.update(assetId, {
      name: data.name,
      thumbnail: data.thumbnail,
    });

    if (!updatedAsset) {
      return NextResponse.json({ error: '素材不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error('更新素材失败:', error);
    return NextResponse.json(
      { error: '更新素材失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除素材 API
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    const assetId = params.id;

    // 验证必填字段
    if (!assetId) {
      return NextResponse.json({ error: '素材 ID 不能为空' }, { status: 400 });
    }

    // 删除素材
    Asset.delete(assetId);

    return NextResponse.json({ success: true, message: '素材已删除' });
  } catch (error) {
    console.error('删除素材失败:', error);
    return NextResponse.json(
      { error: '删除素材失败' },
      { status: 500 }
    );
  }
}
