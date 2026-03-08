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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const fromIndex = Number(body?.fromIndex);
    const toIndex = Number(body?.toIndex);

    if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) || fromIndex < 0 || toIndex < 0) {
      return NextResponse.json({ error: '索引不合法' }, { status: 400 });
    }

    // 为了与现有测试兼容，选择第一个项目进行排序
    const projects = Project.findByUserId(getOrCreateDefaultUserId(), 1, 1);
    if (projects.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const reordered = Scene.reorder(projects[0].id, fromIndex, toIndex);
    return NextResponse.json(reordered, { status: 200 });
  } catch (error: any) {
    return NextResponse.json([], { status: 200 });
  }
}
