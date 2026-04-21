// One-off local harness to invoke the Vercel bundled function
// and print the real error for a given path.
import http from "http";
import { pathToFileURL } from "url";

const path = process.argv[2] || "/api/organizations";

const mod = await import(pathToFileURL("api/index.js").href);
const handler = mod.default;

const req = new http.IncomingMessage(null);
req.method = "GET";
req.url = path;
req.headers = { host: "localhost" };

const chunks = [];
const res = new http.ServerResponse(req);
res.statusCode = 200;
// Capture write/end
const origWrite = res.write.bind(res);
const origEnd = res.end.bind(res);
res.write = (c, ...r) => { if (c) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)); return true; };
res.end = (c, ...r) => { if (c) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)); finish(); };

function finish() {
  console.log("status:", res.statusCode);
  console.log("body:", Buffer.concat(chunks).toString("utf8").slice(0, 1000));
  process.exit(0);
}

try {
  await handler(req, res);
} catch (err) {
  console.error("THREW:", err);
  process.exit(1);
}

// If no response after 5s, bail
setTimeout(() => {
  console.error("timed out waiting for response");
  console.error("res.headersSent:", res.headersSent, "res.statusCode:", res.statusCode);
  process.exit(1);
}, 5000);
