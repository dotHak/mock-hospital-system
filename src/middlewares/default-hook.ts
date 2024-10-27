import type { Hook } from "@hono/zod-openapi";

import { UNPROCESSABLE_ENTITY } from "@/http-status-codes";
import { UNPROCESSABLE_ENTITY as UNPROCESSABLE_ENTITY_PHRASE } from "@/http-status-phrases";
import { formatZodError } from "@/lib/format_error";

const defaultHook: Hook<any, any, any, any> = (result, c) => {
    if (!result.success) {
        return c.json(
            {
                success: result.success,
                error: formatZodError(result.error),
                message: UNPROCESSABLE_ENTITY_PHRASE + ": One or more fields are invalid",
                code: UNPROCESSABLE_ENTITY,
            },
            UNPROCESSABLE_ENTITY,
        );
    }
};

export default defaultHook;
