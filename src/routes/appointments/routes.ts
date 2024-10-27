import { createRoute, z } from "@hono/zod-openapi";

import { InsertAppointmentSchema, SelectAppointmentSchema } from "@/db/schema";
import * as HttpStatusCodes from "@/http-status-codes";
import { ErrorSchema } from "@/types/routes";
import jsonContent from "@/utils/json-content";

import { GetOneIdParam } from "../helpers";

const tags = ["Appointments"];

export const ListRoute = createRoute({
    method: "get",
    path: "/",
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.array(SelectAppointmentSchema),
            "Find all appointments",
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
        [HttpStatusCodes.OK]: jsonContent(SelectAppointmentSchema, "Find an appointment by ID"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Appointment not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid ID"),
    },
});

export const CreateRoute = createRoute({
    method: "post",
    path: "/",
    tags,
    request: {
        body: jsonContent(InsertAppointmentSchema, "Appointment to create"),
    },
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(SelectAppointmentSchema, "Appointment created"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid input"),
    },
});

export const UpdateRoute = createRoute({
    method: "put",
    path: "/{id}",
    tags,
    request: {
        params: GetOneIdParam,
        body: jsonContent(
            InsertAppointmentSchema.omit({
                appointmentDate: true,
                startTime: true,
                endTime: true,
                doctorId: true,
            }).partial(),
            "Appointment to update",
        ),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(SelectAppointmentSchema, "Appointment updated"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Appointment not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid request"),
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
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                message: z.string().openapi({
                    example: "Appointment deleted",
                }),
                id: z.number().openapi({
                    example: 1,
                }),
            }),
            "Appointment deleted",
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, "Appointment not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Invalid ID"),
    },
});

export type ListRouteType = typeof ListRoute;
export type GetOneRouteType = typeof GetOneRoute;
export type CreateRouteType = typeof CreateRoute;
export type UpdateRouteType = typeof UpdateRoute;
export type DeleteRouteType = typeof DeleteRoute;
