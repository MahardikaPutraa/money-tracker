const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const root = __dirname;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const requested = cleanPath === "/" ? "/index.html" : cleanPath;
  const fullPath = path.join(root, requested);
  const normalized = path.normalize(fullPath);
  if (!normalized.startsWith(root)) {
    return null;
  }
  return normalized;
}

http
  .createServer((req, res) => {
    const filePath = resolvePath(req.url || "/");
    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const targetPath = stats.isDirectory()
        ? path.join(filePath, "index.html")
        : filePath;

      fs.readFile(targetPath, (readError, data) => {
        if (readError) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const ext = path.extname(targetPath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": contentTypes[ext] || "application/octet-stream",
          "Cache-Control": "no-cache"
        });
        res.end(data);
      });
    });
  })
  .listen(port, () => {
    console.log(`Luxentra Finance is available at http://localhost:${port}`);
  });
