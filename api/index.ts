import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../server/app";

const ready = createApp();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const { app } = await ready;
  return (app as any)(req, res);
}
