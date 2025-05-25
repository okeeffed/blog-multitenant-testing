import { serve } from "@hono/node-server";
import { server } from "./mocks/node";

import { app } from "./server";

server.listen();

serve({
  fetch: app.fetch,
  port: 3000,
});
