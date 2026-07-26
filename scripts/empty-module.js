// Turbopack 兜底空模块：ali-oss 依赖的 urllib 里有动态 require('proxy-agent')，
// 该模块在 npm 上可选且本项目不走 HTTP 代理，运行时不会真正调用。
// 此文件被 next.config.js 的 turbopack.resolveAlias 指向，避免打包期 Module not found。
module.exports = {}
