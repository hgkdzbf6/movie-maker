# Remotion 视频编辑器 - 开发指南

**版本**: 1.0.0
**更新日期**: 2026-03-07

---

## 📋 目录

1. [快速开始](#快速开始)
2. [定时任务系统](#定时任务系统)
3. [单元测试](#单元测试)
4. [后端开发](#后端开发)
5. [部署](#部署)

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 一键启动前端 + 后端调度器

```bash
npm run dev:all
```

该命令会同时启动 Next.js 前端（含 API）和 `tasks/scheduler.ts` 监控进程。

---

## ⏰ 定时任务系统

### 任务调度器

任务调度器位于 `tasks/scheduler.ts`，每小时自动执行以下任务：

1. **自动保存** - 保存项目到数据库
2. **导出队列处理** - 处理待导出的视频
3. **清理临时文件** - 清理过期的临时文件
4. **生成缩略图** - 为未生成缩略图的视频生成缩略图
5. **备份数据库** - 备份 SQLite 数据库

### 运行任务调度器

#### 手动执行一次

```bash
npm run scheduler
```

#### 监控模式（每小时执行一次）

```bash
npm run scheduler:watch
```

### 配置 cron 任务

#### Linux/Mac (使用 cron)

```bash
# 编辑 crontab
crontab -e

# 添加每小时执行一次的任务
0 * * * * cd /path/to/remotion-video-editor && npm run scheduler >> .logs/scheduler.log 2>&1
```

#### Windows (使用 Windows 任务计划程序)

1. 打开"任务计划程序"
2. 创建基本任务
3. 设置触发器：每天、重复一次、开始于 00:00
4. 设置操作：启动程序
   - 程序/脚本: `node`
   - 添加参数: `path/to/node_modules/.bin/ts-node --esm tasks/scheduler.ts`
   - 起始于: 项目根目录

### 任务日志

任务日志存储在 `.logs/` 目录：

- `auto-save-{timestamp}.log` - 自动保存日志
- `export-queue-{timestamp}.log` - 导出队列日志
- `cleanup-{timestamp}.log` - 清理文件日志
- `thumbnails-{timestamp}.log` - 缩略图生成日志
- `backup-{timestamp}.log` - 数据库备份日志
- `errors-{timestamp}.log` - 错误日志

---

## 🧪 单元测试

### 安装测试依赖

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-node nodemon ts-jest @types/jest
```

### 运行测试

#### 运行所有测试

```bash
npm test
```

#### 运行测试并监听变化

```bash
npm run test:watch
```

#### 生成测试覆盖率报告

```bash
npm run test:coverage
```

#### 只运行单元测试

```bash
npm run test:unit
```

#### 只运行集成测试

```bash
npm run test:integration
```

#### 只运行端到端测试

```bash
npm run test:e2e
```

### 测试目录结构

```
__tests__/
├── unit/           # 单元测试
│   ├── components/  # 组件测试
│   │   ├── Timeline.test.tsx
│   │   ├── InspectorPanel.test.tsx
│   │   ├── AssetList.test.tsx
│   │   └── ...
│   ├── api/          # API 测试
│   │   ├── projects.test.ts
│   │   ├── scenes.test.ts
│   │   ├── assets.test.ts
│   │   └── ...
│   ├── services/     # 服务层测试
│   │   ├── editor.test.ts
│   │   ├── export.test.ts
│   │   └── ...
│   └── utils/        # 工具函数测试
│       ├── time.test.ts
│       ├── format.test.ts
│       └── ...
├── integration/     # 集成测试
│   ├── editor.test.ts
│   ├── export.test.ts
│   └── ...
└── e2e/             # 端到端测试
    ├── editor-flow.test.ts
    ├── export-flow.test.ts
    └── ...
```

### 编写测试

#### 组件测试示例

```typescript
// __tests__/unit/components/Timeline.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Timeline } from '@/components/Timeline';

describe('Timeline Component', () => {
  it('应该正确渲染时间轴组件', () => {
    render(<Timeline fps={30} />);
    expect(screen.getByText(/0s/i)).toBeInTheDocument();
  });

  it('应该响应时间轴点击', () => {
    const mockSetCurrentFrame = jest.fn();
    render(<Timeline fps={30} />);

    const timelineContent = screen.getByText(/Video Track/i);
    fireEvent.click(timelineContent);

    expect(mockSetCurrentFrame).toHaveBeenCalled();
  });
});
```

#### API 测试示例

```typescript
// __tests__/unit/api/projects.test.ts
import { GET, POST } from '@/app/api/projects/route';

describe('Projects API', () => {
  it('GET /api/projects 应该返回项目列表', async () => {
    const request = new Request('http://localhost:3000/api/projects', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST /api/projects 应该创建新项目', async () => {
    const newProject = {
      name: '测试项目',
      config: {
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 180,
      },
    };

    const request = new Request('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify(newProject),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(newProject.name);
  });
});
```

---

## 🔧 后端开发

### 数据库

使用 SQLite 作为开发数据库：

```bash
npm install better-sqlite3
```

### 数据库模型

```typescript
// lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'remotion.db');
const db = new Database(dbPath);

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    thumbnail TEXT,
    config TEXT NOT NULL,
    scenes TEXT NOT NULL,
    assets TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scenes (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    start_frame INTEGER NOT NULL,
    duration_frames INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    duration REAL,
    width INTEGER,
    height INTEGER,
    thumbnail TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exports (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    format TEXT NOT NULL,
    quality TEXT NOT NULL,
    filename TEXT NOT NULL,
    output_path TEXT NOT NULL,
    status TEXT NOT NULL,
    progress REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );
`);

export { db };
```

### API 路由

#### 项目管理 API

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  let query = 'SELECT * FROM projects ORDER BY created_at DESC';
  const params: any[] = [];

  if (search) {
    query += ' WHERE name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  const projects = db.prepare(query).all(...params);

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || !body.config) {
    return NextResponse.json(
      { error: '名称和配置是必填的' },
      { status: 400 }
    );
  }

  const project = {
    id: randomUUID(),
    name: body.name,
    thumbnail: body.thumbnail || null,
    config: JSON.stringify(body.config),
    scenes: JSON.stringify([]),
    assets: JSON.stringify([]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO projects (id, name, thumbnail, config, scenes, assets, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    project.id,
    project.name,
    project.thumbnail,
    project.config,
    project.scenes,
    project.assets,
    project.created_at,
    project.updated_at
  );

  return NextResponse.json(project, { status: 201 });
}
```

#### 场景管理 API

```typescript
// app/api/projects/[id]/scenes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  if (!body.name || !body.type) {
    return NextResponse.json(
      { error: '名称和类型是必填的' },
      { status: 400 }
    );
  }

  // 验证项目存在
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(params.id);
  if (!project) {
    return NextResponse.json(
      { error: '项目不存在' },
      { status: 404 }
    );
  }

  const scene = {
    id: randomUUID(),
    project_id: params.id,
    name: body.name,
    type: body.type,
    start_frame: body.startFrame || 0,
    duration_frames: body.durationFrames || 90,
    content: JSON.stringify(body.content || {}),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO scenes (id, project_id, name, type, start_frame, duration_frames, content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    scene.id,
    scene.project_id,
    scene.name,
    scene.type,
    scene.start_frame,
    scene.duration_frames,
    scene.content,
    scene.created_at,
    scene.updated_at
  );

  // 更新项目的 scenes 字段
  const scenes = JSON.parse(project.scenes);
  scenes.push(scene);
  db.prepare('UPDATE projects SET scenes = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(scenes), new Date().toISOString(), params.id);

  return NextResponse.json(scene, { status: 201 });
}
```

---

## 📦 部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./

RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# 构建并运行 Docker
docker build -t remotion-video-editor .
docker run -p 3000:3000 remotion-video-editor
```

---

## 📝 开发规范

### Git 提交信息

```
<type>(<scope>): <subject>

<body>
```

类型：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建工具或辅助工具的变动

范围：
- `editor`: 编辑器功能
- `api`: API 相关
- `ui`: UI 组件
- `store`: 状态管理
- `scheduler`: 定时任务
- `test`: 测试

示例：
```
feat(editor): 添加场景延伸手柄
fix(api): 修复场景排序问题
test(components): 添加 Timeline 组件测试
chore(scheduler): 优化自动保存逻辑
```

### 代码审查清单

- [ ] 代码符合 ESLint 规范
- [ ] 添加了必要的注释
- [ ] 通过了所有单元测试
- [ ] 更新了相关文档
- [ ] 提交信息清晰

---

## 🆘 获取帮助

- [Remotion 官方文档](https://www.remotion.dev/)
- [Next.js 文档](https://nextjs.org/docs)
- [Jest 文档](https://jestjs.io/)
- [Tailwind CSS 文档](https://tailwindcss.com/)

---

**最后更新**: 2026-03-07 20:00
