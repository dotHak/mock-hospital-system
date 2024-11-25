import { serve } from "@hono/node-server";

import app from "@/app";
import env from "@/env";

console.log(`Server is running on url: http://localhost:${env.PORT}`);

serve({
    fetch: app.fetch,
    port: env.PORT,
    hostname: env.HOST_NAME,
});
