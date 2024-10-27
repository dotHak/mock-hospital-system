import { createRoute, z } from "@hono/zod-openapi";
import { z as zz } from "zod";
import * as HttpStatusCodes from "@/http-status-codes";
import jsonContent from "@/utils/json-content";
import { InsertServiceSchema, SelectServiceSchema } from "@/db/schema";
import { GetOneIdParam, MessageSchema } from "../helpers";
import { ErrorSchema } from "@/types";
import doctors from "../doctors";

const tags = ["Services"];

export const ListRoute = createRoute({
    method: "get",
    path: "/",
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(SelectServiceSchema), "List of services"),
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
        [HttpStatusCodes.OK]: jsonContent(SelectServiceSchema, "Service details"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Service not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid id"),
    },
});

const CreateServiceSchema = InsertServiceSchema.extend({
    doctorIds: zz.array(zz.number()).min(1).optional(),
});

export const CreateRoute = createRoute({
    method: "post",
    path: "/",
    tags,
    request: {
        body: jsonContent(CreateServiceSchema, "Service data"),
    },
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(CreateServiceSchema, "Service created"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid data"),
    },
});

export const UpdateRoute = createRoute({
    method: "put",
    path: "/{id}",
    tags,
    request: {
        params: GetOneIdParam,
        body: jsonContent(CreateServiceSchema.partial(), "Service data"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(CreateServiceSchema, "Service updated"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Service not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid id or data"),
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
        [HttpStatusCodes.OK]: jsonContent(MessageSchema, "Service deleted"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Service not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid id"),
    },
});

export type ListRouteType = typeof ListRoute;
export type GetOneRouteType = typeof GetOneRoute;
export type CreateRouteType = typeof CreateRoute;
export type UpdateRouteType = typeof UpdateRoute;
export type DeleteRouteType = typeof DeleteRoute;
