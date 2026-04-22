import { createApp } from "./app.js";
import { setupVite, serveStatic } from "./vite.js";
import { log } from "./log.js";
import { seedDatabase } from "./seed.js";

(async () => {
  const { app, server } = await createApp();

  await seedDatabase();

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
