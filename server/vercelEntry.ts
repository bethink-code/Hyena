import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "./app.js";

let ready: ReturnType<typeof createApp> | undefined;
let bootError: unknown;

try {
  ready = createApp();
} catch (err) {
  bootError = err;
  console.error("createApp threw synchronously:", err);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (bootError) throw bootError;
    if (!ready) throw new Error("handler not ready");
    const { app } = await ready;
    return (app as any)(req, res);
  } catch (err: any) {
    console.error("Vercel handler error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        error: "handler crashed",
        message: err?.message ?? String(err),
        name: err?.name,
        code: err?.code,
        stack: (err?.stack ?? "").split("\n").slice(0, 10),
      }));
    }
  }
}
