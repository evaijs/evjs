import { createServer } from "@evjs/runtime/server";
import path from "node:path";

createServer({
  port: 3001,
  staticDir: path.join(__dirname, "../client"),
});
