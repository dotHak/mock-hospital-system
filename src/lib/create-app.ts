import { OpenAPIHono } from "@hono/zod-openapi";

import { AppBindings } from "@/types/app";
import defaultHook from "@/middlewares/default-hook";

export const createApp = () => {
    return new OpenAPIHono<AppBindings>({
        strict: false,
        defaultHook: defaultHook,
    });
};

export default createApp;
