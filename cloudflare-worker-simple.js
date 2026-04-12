// Cloudflare Worker 简单代理版本
export default {
  async fetch(request, env, ctx) {
    try {
      // 获取目标 URL
      const targetUrl = new URL(request.url);
      targetUrl.host = 'next-blog-platform-chi.vercel.app';
      targetUrl.protocol = 'https:';

      // 转发请求
      const modifiedRequest = new Request(targetUrl, request);

      // 添加必要的头部
      modifiedRequest.headers.set('X-Forwarded-Host', request.headers.get('Host') || '');
      modifiedRequest.headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');

      // 获取响应
      const response = await fetch(modifiedRequest, {
        cf: {
          // 禁用 Cloudflare 缓存，确保获取最新内容
          cacheTtl: 0,
          cacheEverything: false,
        }
      });

      // 克隆响应以修改头部
      const newResponse = new Response(response.body, response);

      // 修复 CSP 和其他安全头部
      newResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
      newResponse.headers.delete('Set-Cookie');

      return newResponse;

    } catch (error) {
      // 错误处理
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
