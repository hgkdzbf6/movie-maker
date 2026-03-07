/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      'pino-pretty': 'commonjs pino-pretty',
    })
  },
  // 开发服务器配置
  async rewrites() {
    return [];
  },
  // 开发服务器监听所有网络接口
  // 通过环境变量 NEXT_PUBLIC_HOST 或启动参数控制
}

// 允许从任意主机访问（用于局域网开发）
module.exports = nextConfig;

// 开发服务器启动参数
// 在 package.json 中添加：
// "dev": "next dev -H 0.0.0.0"
