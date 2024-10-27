import { z } from "@hono/zod-openapi";

export const GetOneIdParam = z.object({
    id: z.coerce.number().openapi({
        param: {
            name: "id",
            in: "path",
        },
        required: ["id"],
        example: 1,
    }),
});

export const MessageSchema = z.object({
    message: z.string().openapi({
        example: "Hello, World!",
    }),
    id: z.number().optional().openapi({
        example: 1,
    }),
});

export const filterUndedinedfields = <T>(obj: T): T => {
    const newObj = {} as T;
    for (const key in obj) {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
};
