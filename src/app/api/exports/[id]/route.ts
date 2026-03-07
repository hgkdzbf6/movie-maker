/**
 * 获取导出任务详情 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { Export } from '@/lib/db';
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

    const exportId = params.id;

    // 验证必填字段
    if (!exportId) {
      return NextResponse.json({ error: '导出任务 ID 不能为空' }, { status: 400 });
    }

    // 获取导出任务
    const exportTask = Export.findById(exportId);

    if (!exportTask) {
      return NextResponse.json({ error: '导出任务不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, export: exportTask });
  } catch (error) {
    console.error('获取导出任务详情失败:', error);
    return NextResponse.json(
      { error: '获取导出任务详情失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新导出任务状态 API
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
    const exportId = params.id;

    // 验证必填字段
    if (!exportId) {
      return NextResponse.json({ error: '导出任务 ID 不能为空' }, { status: 400 });
    }

    // 更新导出任务
    const updatedExport = Export.update(exportId, {
      status: data.status,
      progress: data.progress,
      error: data.error,
      outputPath: data.outputPath,
    });

    if (!updatedExport) {
      return NextResponse.json({ error: '导出任务不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, export: updatedExport });
  } catch (error) {
    console.error('更新导出任务失败:', error);
    return NextResponse.json(
      { error: '更新导出任务失败' },
      { status: 500 }
    );
  }
}

/**
 * 取消导出任务 API
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

    const exportId = params.id;

    // 验证必填字段
    if (!exportId) {
      return NextResponse.json({ error: '导出任务 ID 不能为空' }, { status: 400 });
    }

    // 取消导出任务（更新状态为 cancelled）
    const cancelledExport = Export.update(exportId, {
      status: 'cancelled',
    });

    if (!cancelledExport) {
      return NextResponse.json({ error: '导出任务不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '导出任务已取消' });
  } catch (error) {
    console.error('取消导出任务失败:', error);
    return NextResponse.json(
      { error: '取消导出任务失败' },
      { status: 500 }
    );
  }
}
