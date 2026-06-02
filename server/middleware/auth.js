/**
 * API Key 认证中间件
 *
 * 设计思路：
 *   本项目是个人看板工具，不需要复杂的用户系统。
 *   采用最简单的「共享密钥」方案：服务端设一个 API_KEY 环境变量，
 *   客户端所有请求在 X-API-Key 头中携带同样的密钥。
 *
 * 行为：
 *   - 如果未设置 API_KEY 环境变量 → 跳过认证（向后兼容，开发环境无需配置）
 *   - 如果设置了 API_KEY → 要求每个 /api 请求携带正确的 X-API-Key 头
 *   - 密钥不匹配 → 返回 401 Unauthorized
 *
 * 为什么不用 JWT / OAuth？
 *   JWT 需要登录接口 + token 刷新逻辑，对个人工具过度设计。
 *   API Key 方案零依赖、零配置（不设 Key 时）、足够安全（只要 Key 不泄露）。
 */

function authMiddleware(req, res, next) {
  const apiKey = process.env.API_KEY;

  // 未设置 API_KEY → 跳过认证（向后兼容）
  if (!apiKey) {
    return next();
  }

  const clientKey = req.headers['x-api-key'];

  if (!clientKey) {
    return res.status(401).json({ error: '缺少 API Key，请在 X-API-Key 请求头中提供' });
  }

  if (clientKey !== apiKey) {
    return res.status(401).json({ error: 'API Key 无效' });
  }

  next();
}

module.exports = authMiddleware;
