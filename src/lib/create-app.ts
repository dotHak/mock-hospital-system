import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "@/types/app";

import defaultHook from "@/middlewares/default-hook";

export function createApp() {
    return new OpenAPIHono<AppBindings>({
        strict: false,
        defaultHook,
    });
}

export default createApp;
