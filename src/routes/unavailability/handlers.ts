import { AppRouteHandler } from "@/types";
import type {
    ListRouteType,
    CreateRouteType,
    GetOneRouteType,
    UpdateRouteType,
    DeleteRouteType,
} from "./routes";
import { db } from "@/db/db";
import { unavailability } from "@/db/schema";
import * as HttpStatusCodes from "@/http-status-codes";
import { filterUndedinedfields } from "../helpers";
import { eq } from "drizzle-orm";

export const list: AppRouteHandler<ListRouteType> = async (c) => {
    const unavailabilities = await db.query.unavailability.findMany();
    return c.json(unavailabilities, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRouteType> = async (c) => {
    const { id } = c.req.valid("param");

    const result = await db.query.unavailability.findFirst({
        where: (d, { eq }) => eq(d.id, id),
        with: {
            doctor: true,
        },
    });

    if (!result) {
        return c.json(
            {
                success: false,
                message: "Unavailability not found",
                code: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }

    return c.json(result, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRouteType> = async (c) => {
    const values = c.req.valid("json");

    //check if the date in the future
    values.startTime = values.startTime || "00:00:00";
    const startDate = new Date(`${values.startDate}T${values.startTime}`);
    values.endTime = values.endTime || "23:59:59";
    const endDate = new Date(`${values.endDate}T${values.endTime}`);

    if (startDate < new Date()) {
        return c.json(
            {
                success: false,
                message: "Start date must be in the future",
                code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
            },
            HttpStatusCodes.UNPROCESSABLE_ENTITY,
        );
    }

    if (endDate < startDate) {
        return c.json(
            {
                success: false,
                message: "End date must be after start date",
                code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
            },
            HttpStatusCodes.UNPROCESSABLE_ENTITY,
        );
    }

    // check if doctor id exists
    const doctor = await db.query.doctors.findFirst({
        where: (d, { eq }) => eq(d.id, values.doctorId),
        columns: {
            id: true,
        },
    });

    if (!doctor) {
        return c.json(
            {
                success: false,
                message: "Doctor not found for id: " + values.doctorId,
                code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
            },
            HttpStatusCodes.UNPROCESSABLE_ENTITY,
        );
    }

    const [result] = await db.insert(unavailability).values(values).returning();

    return c.json(result, HttpStatusCodes.CREATED);
};

export const update: AppRouteHandler<UpdateRouteType> = async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const values = filterUndedinedfields(body);

    if (Object.keys(values).length < 1) {
        return c.json(
            {
                success: false,
                message: "No fields to update",
                code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
            },
            HttpStatusCodes.UNPROCESSABLE_ENTITY,
        );
    }

    if (values.doctorId) {
        const doctor = await db.query.doctors.findFirst({
            where: (d, { eq }) => eq(d.id, values.doctorId!),
            columns: {
                id: true,
            },
        });

        if (!doctor) {
            return c.json(
                {
                    success: false,
                    message: "Doctor not found for id: " + values.doctorId,
                    code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
                },
                HttpStatusCodes.UNPROCESSABLE_ENTITY,
            );
        }
    }

    const oldUnavailability = await db.query.unavailability.findFirst({
        where: (d, { eq }) => eq(d.id, id),
        columns: {
            startDate: true,
            endDate: true,
            startTime: true,
            endTime: true,
        },
    });

    if (!oldUnavailability) {
        return c.json(
            {
                success: false,
                message: "Unavailability not found",
                code: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }

    if (values.startDate) {
        values.startTime = values.startTime || oldUnavailability.startTime;
        const startDate = new Date(`${values.startDate}T${values.startTime}`);
        if (startDate < new Date()) {
            return c.json(
                {
                    success: false,
                    message: "Start date must be in the future",
                    code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
                },
                HttpStatusCodes.UNPROCESSABLE_ENTITY,
            );
        }
    }

    if (values.endDate && values.startDate) {
        values.endTime = values.endTime || oldUnavailability.endTime;
        values.startTime = values.startTime || oldUnavailability.startTime;
        const endDate = new Date(`${values.endDate}T${values.endTime}`);
        const startDate = new Date(`${values.startDate}T${values.startTime}`);
        if (endDate < startDate) {
            return c.json(
                {
                    success: false,
                    message: "End date must be after start date",
                    code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
                },
                HttpStatusCodes.UNPROCESSABLE_ENTITY,
            );
        }
    }

    if (values.endDate && !values.startDate) {
        const startDate = new Date(`${oldUnavailability.startDate}T${oldUnavailability.startTime}`);
        values.endTime = values.endTime || oldUnavailability.endTime;
        const endDate = new Date(`${values.endDate}T${values.endTime}`);

        if (endDate < startDate) {
            return c.json(
                {
                    success: false,
                    message: "End date must be after start date",
                    code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
                },
                HttpStatusCodes.UNPROCESSABLE_ENTITY,
            );
        }
    }

    const [result] = await db
        .update(unavailability)
        .set(values)
        .where(eq(unavailability.id, id))
        .returning();

    if (!result) {
        return c.json(
            {
                success: false,
                message: "Unavailability not found",
                code: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }

    return c.json(result, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<DeleteRouteType> = async (c) => {
    const { id } = c.req.valid("param");
    const [result] = await db.delete(unavailability).where(eq(unavailability.id, id)).returning({
        id: unavailability.id,
    });

    if (!result) {
        return c.json(
            {
                success: false,
                message: "Unavailability not found",
                code: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }

    return c.json(
        {
            message: "Unavailability deleted successfully",
            id: result.id,
        },
        HttpStatusCodes.OK,
    );
};
