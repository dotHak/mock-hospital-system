import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/types";

import { db } from "@/db/db";
import { serviceDoctors, services } from "@/db/schema";
import * as HttpStatusCodes from "@/http-status-codes";

import type {
    CreateRouteType,
    DeleteRouteType,
    GetOneRouteType,
    ListRouteType,
    UpdateRouteType,
} from "./routes";

import { filterUndedinedfields } from "../helpers";

export const list: AppRouteHandler<ListRouteType> = async (c) => {
    const results = await db.query.services.findMany();

    return c.json(results, HttpStatusCodes.OK);
};

function getOneService(id: number) {
    return db.query.services.findFirst({
        where: (s, { eq }) => eq(s.id, id),
        with: {
            serviceDoctors: {
                columns: {
                    serviceId: false,
                    id: false,
                    doctorId: false,
                },
                with: {
                    doctor: true,
                },
            },
        },
    });
}
export const getOne: AppRouteHandler<GetOneRouteType> = async (c) => {
    const { id } = c.req.valid("param");
    const result = await db.query.services.findFirst({
        where: (s, { eq }) => eq(s.id, id),
        with: {
            serviceDoctors: {
                columns: {
                    serviceId: false,
                    id: false,
                    doctorId: false,
                },
                with: {
                    doctor: true,
                },
            },
        },
    });

    if (!result) {
        return c.json(
            {
                message: "Service not found",
                success: false,
                code: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }

    return c.json(result, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRouteType> = async (c) => {
    const { title, context, doctorIds } = c.req.valid("json");

    if (doctorIds && doctorIds.length > 0) {
        // Check if the doctorIds are valid
        const doctors = await db.query.doctors.findMany({
            where: (d, { inArray }) => inArray(d.id, doctorIds),
            columns: {
                id: true,
            },
        });

        if (doctors.length !== doctorIds.length) {
            const invalidDoctorIds = doctorIds.filter(id => !doctors.some(d => d.id === id));
            const invalidDoctorIdsStr = invalidDoctorIds.join(", ");
            return c.json(
                {
                    message: `Invalid doctorIds: ${invalidDoctorIdsStr}`,
                    success: false,
                    code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
                },
                HttpStatusCodes.UNPROCESSABLE_ENTITY,
            );
        }
    }

    const [service] = await db
        .insert(services)
        .values({
            title,
            context,
        })
        .returning();

    const serviceDoctorValues = doctorIds!.map(doctorId => ({
        serviceId: service.id,
        doctorId,
    }));

    const [_, result] = await db.batch([
        db.insert(serviceDoctors).values(serviceDoctorValues),
        db.query.services.findFirst({
            where: (s, { eq }) => eq(s.id, service.id),
            with: {
                serviceDoctors: {
                    columns: {
                        serviceId: false,
                        id: false,
                        doctorId: false,
                    },
                    with: {
                        doctor: true,
                    },
                },
            },
        }),
    ]);

    return c.json(result, HttpStatusCodes.CREATED);
};

export const update: AppRouteHandler<UpdateRouteType> = async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const values = filterUndedinedfields(body);

    const doctorIds = values.doctorIds;
    c.var.logger.info("values", doctorIds);

    if (Object.keys(values).length === 0) {
        return c.json(
            {
                message: "No fields to update",
                success: false,
                code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
            },
            HttpStatusCodes.UNPROCESSABLE_ENTITY,
        );
    }

    // check if the service exists
    const service = await db.query.services.findFirst({
        where: (s, { eq }) => eq(s.id, id),
        columns: {
            id: true,
        },
    });

    if (!service) {
        return c.json(
            {
                message: `Service not found for id ${id}`,
                success: false,
                code: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }

    if (doctorIds) {
        // Check if the doctorIds are valid
        const doctors = await db.query.doctors.findMany({
            where: (d, { inArray }) => inArray(d.id, doctorIds!),
            columns: {
                id: true,
            },
        });

        if (doctors.length !== doctorIds.length) {
            const invalidDoctorIds = doctorIds.filter(id => !doctors.some(d => d.id === id));
            const invalidDoctorIdsStr = invalidDoctorIds.join(", ");
            return c.json(
                {
                    message: `Invalid doctorIds: ${invalidDoctorIdsStr}`,
                    success: false,
                    code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
                },
                HttpStatusCodes.UNPROCESSABLE_ENTITY,
            );
        }
    }

    delete values.doctorIds;

    let resultFinal;

    if (Object.keys(values).length > 0 && !doctorIds) {
        c.var.logger.info("Values");
        const [_, results] = await db.batch([
            db.update(services).set(values).where(eq(services.id, id)),
            getOneService(service.id),
        ]);

        resultFinal = results;
    }
    else if (Object.keys(values).length > 0 && doctorIds) {
        c.var.logger.info("Values and doctorIds");
        const serviceDoctorValues = doctorIds!.map(doctorId => ({
            serviceId: id,
            doctorId,
        }));

        const [_, __, ___, result] = await db.batch([
            db.update(services).set(values).where(eq(services.id, id)),
            db.delete(serviceDoctors).where(eq(serviceDoctors.serviceId, id)),
            db.insert(serviceDoctors).values(serviceDoctorValues),
            getOneService(service.id),
        ]);

        resultFinal = result;
    }
    else if (Object.keys(values).length === 0 && doctorIds) {
        c.var.logger.info("doctorIds");
        const serviceDoctorValues = doctorIds!.map(doctorId => ({
            serviceId: id,
            doctorId,
        }));

        const [_, __, result] = await db.batch([
            db.delete(serviceDoctors).where(eq(serviceDoctors.serviceId, id)),
            db.insert(serviceDoctors).values(serviceDoctorValues),
            getOneService(service.id),
        ]);

        resultFinal = result;
    }

    return c.json(resultFinal, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<DeleteRouteType> = async (c) => {
    const { id } = c.req.valid("param");

    const [service] = await db.delete(services).where(eq(services.id, id)).returning({
        id: services.id,
    });

    if (!service) {
        return c.json(
            {
                message: `Service not found for id ${id}`,
                success: false,
                code: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }

    return c.json(
        {
            message: "Service deleted successfully",
            id: service.id,
        },
        HttpStatusCodes.OK,
    );
};
