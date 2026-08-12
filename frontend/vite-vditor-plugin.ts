import fs from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".gif": "image/gif",
}

export function localVditorAssets(): Plugin {
  const packageRoot = path.resolve(__dirname, "node_modules/vditor")
  return {
    name: "aestival-local-vditor-assets",
    configureServer(server) {
      server.middlewares.use("/__vditor", (request, response, next) => {
        const rawPath = decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/")
        const relativePath = rawPath.replace(/^\/+/, "")
        const target = path.resolve(packageRoot, relativePath)
        if (!target.startsWith(`${packageRoot}${path.sep}`) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
          next()
          return
        }
        response.setHeader("Content-Type", mimeTypes[path.extname(target)] ?? "application/octet-stream")
        fs.createReadStream(target).pipe(response)
      })
    },
    closeBundle() {
      const output = path.resolve(__dirname, "dist/vditor/dist")
      fs.mkdirSync(path.dirname(output), { recursive: true })
      fs.cpSync(path.resolve(packageRoot, "dist"), output, { recursive: true })
    },
  }
}
