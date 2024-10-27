import { createRoute, z } from "@hono/zod-openapi";
import { GetOneIdParam } from "../helpers";
import * as HttpStatusCodes from "@/http-status-codes";
import jsonContent from "@/utils/json-content";
import { ErrorSchema } from "@/types";

const tags = ["Availability"];

export const ListRoute = createRoute({
    method: "get",
    path: "/{id}",
    tags,
    request: {
        params: GetOneIdParam,
        query: z.object({
            startDate: z
                .string()
                .date()
                .openapi({
                    example: "2024-11-30",
                    param: {
                        name: "startDate",
                        in: "query",
                    },
                }),
            endDate: z
                .string()
                .date()
                .openapi({
                    example: "2024-12-30",
                    param: {
                        name: "endDate",
                        in: "query",
                    },
                }),
        }),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.array(
                z.object({
                    startDateTime: z.string().datetime().openapi({
                        example: "2024-11-30T09:00:00",
                    }),
                    endDateTime: z.string().datetime().openapi({
                        example: "2024-11-30T09:30:00",
                    }),
                    isAvailable: z.boolean().openapi({
                        example: true,
                    }),
                }),
            ),
            "List all availabilities",
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Doctor not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid input"),
    },
});

export type ListRouteType = typeof ListRoute;
