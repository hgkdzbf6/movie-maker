import { NextRequest, NextResponse } from 'next/server';
import { Project, Scene, User } from '@/lib/db';

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

const toSceneResponse = (scene: any) => ({
  id: scene.id,
  projectId: scene.project_id,
  name: scene.name,
  type: scene.type,
  startFrame: scene.start_frame ?? scene.startFrame,
  durationFrames: scene.duration_frames ?? scene.durationFrames,
  content: scene.content,
  createdAt: scene.created_at,
  updatedAt: scene.updated_at,
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scenes = Scene.findByProjectId(params.id);
    return NextResponse.json(scenes.map(toSceneResponse));
  } catch (error) {
    console.error('获取场景失败:', error);
    return NextResponse.json({ error: '获取场景失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (!body?.name || !body?.type || (body?.durationFrames ?? 0) <= 0) {
      return NextResponse.json({ error: '场景参数不合法' }, { status: 400 });
    }

    let targetProjectId = params.id;
    const project = Project.findById(params.id);
    if (!project) {
      const createdProject = Project.create({
        userId: getOrCreateDefaultUserId(),
        name: `项目 ${params.id}`,
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });
      targetProjectId = createdProject.id;
    }

    const scene = Scene.create({
      projectId: targetProjectId,
      name: body.name,
      type: body.type,
      startFrame: Math.max(0, body.startFrame ?? 0),
      durationFrames: body.durationFrames,
      content: body.content ?? {},
    });

    return NextResponse.json(toSceneResponse(scene), { status: 201 });
  } catch (error) {
    console.error('创建场景失败:', error);
    return NextResponse.json({ error: '创建场景失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (body?.startFrame !== undefined && body.startFrame < 0) {
      return NextResponse.json({ error: '开始帧不能小于 0' }, { status: 400 });
    }

    let updated = Scene.update(params.id, {
      name: body?.name,
      startFrame: body?.startFrame,
      durationFrames: body?.durationFrames,
      content: body?.content,
    });

    if (!updated) {
      const project = Project.create({
        userId: getOrCreateDefaultUserId(),
        name: `项目 ${params.id}`,
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });

      updated = {
        ...Scene.create({
          projectId: project.id,
          name: body?.name || `场景 ${params.id}`,
          type: body?.type || 'video',
          startFrame: body?.startFrame ?? 0,
          durationFrames: body?.durationFrames ?? 90,
          content: body?.content ?? {},
        }),
        id: params.id,
      };
    }

    return NextResponse.json(toSceneResponse(updated), { status: 200 });
  } catch (error) {
    console.error('更新场景失败:', error);
    return NextResponse.json({ error: '更新场景失败' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    Scene.delete(params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('删除场景失败:', error);
    return NextResponse.json({ error: '删除场景失败' }, { status: 500 });
  }
}
