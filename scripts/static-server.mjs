import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { basename, dirname, extname, resolve, sep } from "node:path";

const root = resolve(process.cwd(), "out");
const port = Number(process.argv[2] ?? process.env.PORT ?? 3200);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2" };

createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname); }
  catch { response.writeHead(400).end("Bad request"); return; }
  const target = resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(`${root}${sep}`)) { response.writeHead(403).end("Forbidden"); return; }
  const options = [target];
  const filename = basename(target);
  if (filename.startsWith("__next.")) {
    const splitAt = filename.indexOf(".", "__next.".length);
    if (splitAt !== -1) {
      const routeRoot = filename.slice(0, splitAt);
      const suffix = filename.slice(splitAt + 1).split(".");
      const dynamicSegment = suffix[0]?.startsWith("$d$");
      if (dynamicSegment) {
        options.push(resolve(dirname(target), routeRoot, suffix[0], suffix.slice(1).join(".")));
      } else {
        options.push(resolve(dirname(target), routeRoot, suffix.join(".")));
      }
    }
  }
  if (!extname(target)) options.push(`${target}.html`, resolve(target, "index.html"));
  const file = options.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  if (!file) { response.writeHead(404).end("Not found"); return; }
  const contentType = extname(file) === ".txt"
    ? file.includes(`${sep}__next.`) ? "text/x-component; charset=utf-8" : "text/plain; charset=utf-8"
    : types[extname(file)] ?? "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType, "X-Content-Type-Options": "nosniff" });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => process.stdout.write(`Static preview ready at http://127.0.0.1:${port}\n`));
