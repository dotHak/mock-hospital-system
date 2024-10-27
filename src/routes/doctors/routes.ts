import { doctors, InsertDoctorSchema, SelectDoctorSchema } from "@/db/schema";
import { createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema } from "@/types/routes";
import { formatZodError } from "@/lib/format_error";
import * as HttpStatusCodes from "@/http-status-codes";
import jsonContent from "@/utils/json-content";
import { GetOneIdParam } from "../helpers";

const tags = ["doctors"];

export const ListRoute = createRoute({
    path: "/",
    method: "get",
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(SelectDoctorSchema), "List all doctors"),
    },
});

export const SearchRoute = createRoute({
    path: "/search",
    method: "get",
    tags,
    request: {
        query: z.object({
            name: z.string().openapi({
                param: {
                    name: "name",
                    in: "query",
                },
                example: "Dr. CILO CAMPANELLA",
            }),
        }),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(SelectDoctorSchema, "Searched doctor"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Doctor not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid input"),
    },
});

export const GetOneRoute = createRoute({
    path: "/{id}",
    method: "get",
    tags,
    request: {
        params: GetOneIdParam,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(SelectDoctorSchema, "Get one doctor"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Doctor not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid input"),
    },
});

export const CreateRoute = createRoute({
    path: "/",
    method: "post",
    tags,
    request: {
        body: jsonContent(InsertDoctorSchema, "Create doctor data"),
    },
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(SelectDoctorSchema, "Create a new doctor"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid input"),
    },
});

export const UpdateRoute = createRoute({
    path: "/{id}",
    method: "put",
    tags,
    request: {
        params: GetOneIdParam,
        body: jsonContent(InsertDoctorSchema.partial(), "Update doctor data"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(SelectDoctorSchema, "Update a doctor"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Doctor not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid input"),
    },
});

export const DeleteRoute = createRoute({
    path: "/{id}",
    method: "delete",
    tags,
    request: {
        params: GetOneIdParam,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                message: z.string().openapi({
                    example: "Doctor deleted",
                }),
                id: z.number().openapi({
                    example: 1,
                }),
            }),
            "Delete a doctor",
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Doctor not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid input"),
    },
});

export type ListRouteType = typeof ListRoute;
export type SearchRouteType = typeof SearchRoute;
export type GetOneRouteType = typeof GetOneRoute;
export type CreateRouteType = typeof CreateRoute;
export type UpdateRouteType = typeof UpdateRoute;
export type DeleteRouteType = typeof DeleteRoute;
