import { AppRouteHandler } from "@/types";
import type { ListRouteType } from "./routes";
import { db } from "@/db/db";
import { unavailability, appointments } from "@/db/schema";
import * as HttpStatusCodes from "@/http-status-codes";
import { sql } from "drizzle-orm";

export const list: AppRouteHandler<ListRouteType> = async (c) => {
    const { id } = c.req.valid("param");
    let { startDate, endDate } = c.req.valid("query");

    startDate = `${startDate} 00:00:00`;
    endDate = `${endDate} 23:59:59`;

    const result = await db.query.doctors.findFirst({
        where: (d, { eq }) => eq(d.id, id),
        columns: {
            id: true,
        },
    });

    if (!result) {
        return c.json(
            {
                success: false,
                message: "Doctor not found",
                code: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }

    const [apps, unavs] = await db.batch([
        db.query.appointments.findMany({
            where: (a, { eq, and, gte, lte }) =>
                and(
                    eq(a.doctorId, id),
                    gte(
                        sql`datetime(${a.appointmentDate}) || ' ' || ${a.startTime}`,
                        sql`datetime(${startDate})`,
                    ),
                    lte(
                        sql`datetime(${a.appointmentDate}) || ' ' || ${a.endTime}`,
                        sql`datetime(${endDate})`,
                    ),
                ),
            columns: {
                appointmentDate: true,
                startTime: true,
                endTime: true,
            },
        }),
        db.query.unavailability.findMany({
            where: (u, { eq, and, gte, lte }) =>
                and(
                    eq(u.doctorId, id),
                    gte(
                        sql`datetime(${u.startDate} || ' ' || ${u.startTime})`,
                        sql`datetime(${startDate})`,
                    ),
                    lte(
                        sql`datetime(${u.endDate} || ' ' || ${u.endTime})`,
                        sql`datetime(${endDate})`,
                    ),
                ),
            columns: {
                startDate: true,
                startTime: true,
                endDate: true,
                endTime: true,
            },
        }),
    ]);

    let unavailabilites = apps.map((app) => ({
        startDateTime: `${app.appointmentDate}T${app.startTime}`,
        endDateTime: `${app.appointmentDate}T${app.endTime}`,
        isAvailable: false,
    }));

    const unavResults = unavs.map((unav) => ({
        startDateTime: `${unav.startDate}T${unav.startTime}`,
        endDateTime: `${unav.endDate}T${unav.endTime}`,
        isAvailable: false,
    }));

    unavailabilites = unavailabilites.concat(unavResults);

    let results = unavailabilites.sort((a, b) => {
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
    });

    // extrapolate the availabilities from the unavailabilities
    const availabilities = [];
    startDate = startDate.split(" ")[0];
    endDate = endDate.split(" ")[0];
    let lastEnd = new Date(startDate);

    for (const unavailability of results) {
        const unavStart = new Date(unavailability.startDateTime);
        const unavEnd = new Date(unavailability.endDateTime);

        if (unavStart > lastEnd) {
            availabilities.push({
                startDateTime: lastEnd.toISOString(),
                endDateTime: unavStart.toISOString(),
                isAvailable: true,
            });
        }

        lastEnd = unavEnd;
    }

    if (lastEnd < new Date(endDate)) {
        availabilities.push({
            startDateTime: lastEnd.toISOString(),
            endDateTime: new Date(endDate).toISOString(),
            isAvailable: true,
        });
    }

    results = results.concat(availabilities);
    results = results.sort((a, b) => {
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
    });

    return c.json(results, HttpStatusCodes.OK);
};
