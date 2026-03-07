/**
 * 导出 API 路由
 * GET    /api/exports           - 获取导出列表
 * POST   /api/exports           - 创建导出任务
 * GET    /api/exports/[id]      - 获取导出详情
 * DELETE /api/exports/[id]      - 取消导出
 */

import { NextRequest, NextResponse } from 'next/server';
import { Export, Project } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import path from 'path';

// 获取导出列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    let exports;

    if (status) {
      exports = Export.findByStatus(status as any);
    } else if (projectId) {
      exports = Export.findByProjectId(projectId);
    } else {
      return NextResponse.json(
        { error: '缺少查询参数' },
        { status: 400 }
      );
    }

    return NextResponse.json(exports);
  } catch (error: any) {
    console.error('获取导出列表失败:', error);
    return NextResponse.json(
      { error: '获取导出列表失败' },
      { status: 500 }
    );
  }
}

// 创建导出任务
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

    const body = await request.json();

    // 验证必填字段
    if (!body.projectId || !body.format || !body.quality) {
      return NextResponse.json(
        { error: '项目 ID、格式和质量是必填的' },
        { status: 400 }
      );
    }

    // 检查项目是否存在
    const project = Project.findById(body.projectId);
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }

    // 验证项目所有权
    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: '无权操作此项目' },
        { status: 403 }
      );
    }

    // 验证格式
    const validFormats = ['mp4', 'gif', 'webm', 'png'];
    if (!validFormats.includes(body.format)) {
      return NextResponse.json(
        { error: '无效的格式' },
        { status: 400 }
      );
    }

    // 验证质量
    const validQualities = ['low', 'medium', 'high'];
    if (!validQualities.includes(body.quality)) {
      return NextResponse.json(
        { error: '无效的质量' },
        { status: 400 }
      );
    }

    // 生成输出文件名
    const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.${body.format}`;
    const outputPath = `/exports/${filename}`;

    const exportTask = Export.create({
      projectId: body.projectId,
      format: body.format,
      quality: body.quality,
      filename,
      outputPath,
    });

    // 启动导出任务
    import('@/lib/remotion-exporter').then(({ exportToMP4, exportToGIF, exportToWebM }) => {
      const exportOptions = {
        projectId: body.projectId,
        format: body.format,
        quality: body.quality,
        outputPath: path.join(process.cwd(), 'public', 'exports', filename),
        onProgress: (progress: number) => {
          // 更新导出进度
          Export.update(exportTask.id, { progress, status: 'processing' });
        },
        onComplete: (outputPath: string) => {
          // 导出完成
          Export.update(exportTask.id, {
            progress: 100,
            status: 'completed',
          });
          console.log(`[导出] 完成: ${outputPath}`);
        },
        onError: (error: Error) => {
          // 导出失败
          Export.update(exportTask.id, {
            status: 'failed',
            error: error.message,
          });
          console.error(`[导出] 失败:`, error);
        },
      };

      // 根据格式选择导出函数
      switch (body.format) {
        case 'mp4':
          exportToMP4(exportOptions).catch(console.error);
          break;
        case 'gif':
          exportToGIF(exportOptions).catch(console.error);
          break;
        case 'webm':
          exportToWebM(exportOptions).catch(console.error);
          break;
        default:
          console.error(`不支持的导出格式: ${body.format}`);
      }
    });

    return NextResponse.json(exportTask, { status: 201 });
  } catch (error: any) {
    console.error('创建导出任务失败:', error);
    return NextResponse.json(
      { error: '创建导出任务失败' },
      { status: 500 }
    );
  }
}
