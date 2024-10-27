import { RouteConfig, RouteHandler, z } from "@hono/zod-openapi";
import { AppBindings } from "@/types/app";

export const ErrorSchema = z
    .object({
        code: z.number().optional().openapi({
            example: 400,
        }),
        message: z.string().openapi({
            example: "Bad Request",
        }),
        success: z.boolean().optional().openapi({
            example: false,
        }),
        errors: z
            .array(
                z.object({
                    path: z.string().openapi({
                        example: "id",
                    }),
                    message: z.string().openapi({
                        example: "Invalid input",
                    }),
                    error: z.string().optional().openapi({
                        example: "invalid_type",
                    }),
                }),
            )
            .optional(),
    })
    .openapi("Error");
