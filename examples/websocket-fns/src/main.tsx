import { createApp } from "@evjs/runtime/client";
import { routeTree } from "./routes";

const app = createApp({ routeTree });

app.render("#app");
