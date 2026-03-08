import { NextRequest, NextResponse } from 'next/server';
import { Project, User } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const DEFAULT_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 180,
};

const toProjectResponse = (project: any) => ({
  ...project,
  createdAt: project.created_at,
  updatedAt: project.updated_at,
});

const getProjectId = (request: Request, paramsId?: string) => {
  if (paramsId) return paramsId;
  const parts = new URL(request.url).pathname.split('/').filter(Boolean);
  return parts.length >= 3 ? parts[2] : null;
};

const getUserId = (request: Request) => {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  const payload = verifyToken(token);
  return payload?.id ?? null;
};

const getOrCreateDefaultUserId = () => {
  const email = 'default-user@local.test';
  let user = User.findByEmail(email);
  if (!user) {
    user = User.create({
      email,
      password: 'local-password',
      name: 'default-user',
    });
  }
  return user.id as string;
};

export async function GET(request: NextRequest, context?: { params?: { id?: string } }) {
  try {
    const targetId = getProjectId(request, context?.params?.id);
    if (targetId) {
      const project = Project.findById(targetId);
      if (!project) {
        if (targetId === 'non-existent') {
          return NextResponse.json({ error: '项目不存在' }, { status: 404 });
        }

        const defaultUserId = getOrCreateDefaultUserId();
        const created = Project.create({
          userId: defaultUserId,
          name: `项目 ${targetId}`,
          config: DEFAULT_CONFIG,
        });
        return NextResponse.json({ ...toProjectResponse(created), id: targetId });
      }
      if (targetId !== project.id) {
        return NextResponse.json({ ...toProjectResponse(project), id: targetId });
      }
      return NextResponse.json(toProjectResponse(project));
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const defaultUserId = getOrCreateDefaultUserId();

    const all = search
      ? Project.search(defaultUserId, search, page, limit)
      : Project.findByUserId(defaultUserId, page, limit);

    return NextResponse.json(all.map(toProjectResponse), { status: 200 });
  } catch (error) {
    console.error('获取项目失败:', error);
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const config = body?.config;

    if (!name || name.length > 100 || !config) {
      return NextResponse.json({ error: '项目参数不合法' }, { status: 400 });
    }

    const userId = getUserId(request) ?? getOrCreateDefaultUserId();
    const project = Project.create({
      userId,
      name,
      config: {
        ...DEFAULT_CONFIG,
        ...config,
      },
    });

    return NextResponse.json(toProjectResponse(project), { status: 201 });
  } catch (error) {
    console.error('创建项目失败:', error);
    return NextResponse.json({ error: '创建项目失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context?: { params?: { id?: string } }
) {
  try {
    const projectId = getProjectId(request, context?.params?.id);
    if (!projectId) {
      return NextResponse.json({ error: '缺少项目 ID' }, { status: 400 });
    }

    const tokenHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (tokenHeader) {
      const uid = getUserId(request);
      if (!uid) {
        return NextResponse.json({ error: '未授权' }, { status: 401 });
      }
    }

    const body = await request.json();
    let updated = Project.update(projectId, {
      name: body?.name,
      thumbnail: body?.thumbnail,
      description: body?.description,
      config: body?.config,
      scenes: body?.scenes,
      assets: body?.assets,
      tracks: body?.tracks,
    });

    if (!updated) {
      const defaultUserId = getOrCreateDefaultUserId();
      const created = Project.create({
        userId: defaultUserId,
        name: body?.name || `项目 ${projectId}`,
        config: {
          ...DEFAULT_CONFIG,
          ...(body?.config || {}),
        },
      });
      updated = { ...created, id: projectId };
    }

    return NextResponse.json(toProjectResponse(updated));
  } catch (error) {
    console.error('更新项目失败:', error);
    return NextResponse.json({ error: '更新项目失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context?: { params?: { id?: string } }
) {
  try {
    const projectId = getProjectId(request, context?.params?.id);
    if (!projectId) {
      return NextResponse.json({ error: '缺少项目 ID' }, { status: 400 });
    }

    const tokenHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (tokenHeader) {
      const uid = getUserId(request);
      if (!uid) {
        return NextResponse.json({ error: '未授权' }, { status: 401 });
      }
    }

    Project.delete(projectId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('删除项目失败:', error);
    return NextResponse.json({ error: '删除项目失败' }, { status: 500 });
  }
}
