import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import { InsertUnavailabilitySchema, SelectUnavailabilitySchema } from "@/db/schema";
import jsonContent from "@/utils/json-content";
import { GetOneIdParam, MessageSchema } from "../helpers";
import { ErrorSchema } from "@/types";

const tags = ["Unavailability"];

export const ListRoute = createRoute({
    method: "get",
    path: "/",
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.array(SelectUnavailabilitySchema),
            "List of unavailability",
        ),
    },
});

export const GetOneRoute = createRoute({
    method: "get",
    path: "/{id}",
    tags,
    request: {
        params: GetOneIdParam,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(SelectUnavailabilitySchema, "Unavailability details"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Unavailability not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid id"),
    },
});

export const CreateRoute = createRoute({
    method: "post",
    path: "/",
    tags,
    request: {
        body: jsonContent(InsertUnavailabilitySchema, "Unavailability details"),
    },
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(
            SelectUnavailabilitySchema,
            "Unavailability created",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid input"),
    },
});

export const UpdateRoute = createRoute({
    method: "put",
    path: "/{id}",
    tags,
    request: {
        params: GetOneIdParam,
        body: jsonContent(InsertUnavailabilitySchema.partial(), "Unavailability details"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(SelectUnavailabilitySchema, "Unavailability updated"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Unavailability not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid id"),
    },
});

export const DeleteRoute = createRoute({
    method: "delete",
    path: "/{id}",
    tags,
    request: {
        params: GetOneIdParam,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(MessageSchema, "Unavailability deleted"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Unavailability not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid id"),
    },
});

export type ListRouteType = typeof ListRoute;
export type GetOneRouteType = typeof GetOneRoute;
export type CreateRouteType = typeof CreateRoute;
export type UpdateRouteType = typeof UpdateRoute;
export type DeleteRouteType = typeof DeleteRoute;
