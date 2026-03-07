/**
 * 更新场景 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { Scene } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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
    const sceneId = params.id;

    // 验证必填字段
    if (!sceneId) {
      return NextResponse.json({ error: '场景 ID 不能为空' }, { status: 400 });
    }

    // 更新场景
    const updatedScene = Scene.update(sceneId, {
      name: data.name,
      startFrame: data.startFrame,
      durationFrames: data.durationFrames,
      content: data.content,
    });

    if (!updatedScene) {
      return NextResponse.json({ error: '场景不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, scene: updatedScene });
  } catch (error) {
    console.error('更新场景失败:', error);
    return NextResponse.json(
      { error: '更新场景失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除场景 API
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

    const sceneId = params.id;

    // 验证必填字段
    if (!sceneId) {
      return NextResponse.json({ error: '场景 ID 不能为空' }, { status: 400 });
    }

    // 删除场景
    Scene.delete(sceneId);

    return NextResponse.json({ success: true, message: '场景已删除' });
  } catch (error) {
    console.error('删除场景失败:', error);
    return NextResponse.json(
      { error: '删除场景失败' },
      { status: 500 }
    );
  }
}
