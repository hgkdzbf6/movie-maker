# 🎬 Remotion 视频编辑器

基于 Remotion 4.0 + Next.js 14 构建的现代化视频编辑器。

## ✨ 特性

- 🎨 基于 Remotion 的程序化视频创作
- 🖥️ 现代化 React 19 界面
- 🎯 实时视频预览
- 📦 素材管理系统
- ⏱️ 时间轴编辑
- 🎭 多场景支持
- 🌙 深色主题支持
- 💾 项目保存与加载

## 🚀 快速开始

### 安装依赖

```bash
cd remotion-video-editor
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
remotion-video-editor/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx    # 预览页面
│   │   ├── editor/     # 编辑器页面
│   │   └── globals.css # 全局样式
│   ├── remotion/          # Remotion 组件
│   │   └── VideoComposition.tsx
│   └── store/            # Zustand 状态管理
│       └── editor.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.1.0 | React 框架 |
| React | 18.3.1 | UI 库 |
| Remotion | 4.0.434 | 视频引擎 |
| Zustand | 5.0.2 | 状态管理 |
| Tailwind CSS | 3.4.17 | 样式框架 |
| TypeScript | 5.7.3 | 类型系统 |

## 🎯 核心功能

### 1. 视频预览器
- 实时预览 Remotion 组件
- 播放控制（播放/暂停/循环）
- 音量控制
- 全屏支持

### 2. 时间轴编辑器
- 场景管理
- 时间轴拖拽
- 场景分割
- 转场效果

### 3. 素材管理
- 图片/视频上传
- 素材预览
- 素材库管理
- 素材搜索

### 4. 状态管理
- 使用 Zustand 进行全局状态管理
- 持久化存储
- 性能优化

## 📖 使用指南

### 创建新项目

1. 点击"新建项目"按钮
2. 设置项目名称和配置
3. 开始编辑

### 编辑视频

1. **添加场景**：点击时间轴上的"添加场景"按钮
2. **上传素材**：从素材库上传图片、视频或音频
3. **调整时间轴**：拖拽场景调整顺序和时长
4. **预览效果**：实时预览视频效果

### 导出视频

1. 点击"导出"按钮
2. 选择导出格式（MP4, GIF 等）
3. 等待渲染完成
4. 下载视频文件

## 🔧 配置

### 环境变量

创建 `.env.local` 文件：

```env
# Remotion 配置
REMOTION_PORT=3000

# AWS S3（可选，用于云端存储）
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name

# OpenAI API（可选，用于字幕生成）
OPENAI_API_KEY=your-openai-key
```

### 修改视频配置

编辑 `src/remotion/VideoComposition.tsx`：

```typescript
const VideoComposition = () => {
  return (
    <Composition
      id="my-video"
      component={MyComponent}
      durationInFrames={180}  // 修改时长
      fps={30}               // 修改帧率
      width={1920}            // 修改宽度
      height={1080}           // 修改高度
    />
  );
};
```

## 🚀 部署

### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 本地部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 📚 学习资源

- [Remotion 官方文档](https://www.remotion.dev/docs)
- [Remotion Editor Starter](https://www.remotion.dev/docs/editor-starter)
- [Next.js 文档](https://nextjs.org/docs)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🎁 致谢

- [Remotion](https://www.remotion.dev/) - 强大的视频创作框架
- [Next.js](https://nextjs.org/) - React 框架
- [Vercel](https://vercel.com/) - 部署平台

---

**Made with ❤️ using Remotion and Next.js**
