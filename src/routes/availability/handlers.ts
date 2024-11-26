import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import { sql } from "drizzle-orm";

import type { AppRouteHandler } from "@/types";

import { db } from "@/db/db";
import * as HttpStatusCodes from "@/http-status-codes";

import type { ListRouteType } from "./routes";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

export const list: AppRouteHandler<ListRouteType> = async (c) => {
    const { id } = c.req.valid("param");
    let { startDate, endDate } = c.req.valid("query");

    // Monday to Friday: 7:00 AM – 5:00 PM
    // Saturday and Sunday: 8:00 AM – 5:00 PM

    const startDay = dayjs(startDate).day();

    if (startDay >= 1 && startDay <= 5) {
        startDate = `${startDate} 07:00:00`;
    }
    else {
        startDate = `${startDate} 08:00:00`;
    }

    endDate = `${endDate} 17:00:00`;


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
            where: (u, { eq, and, gte, lte, or }) =>
                and(
                    eq(u.doctorId, id),
                    or(
                        and(
                            gte(
                                sql`datetime(${u.startDate} || ' ' || ${u.startTime})`,
                                sql`datetime(${startDate})`,
                            ),
                            lte(
                                sql`datetime(${u.endDate} || ' ' || ${u.endTime})`,
                                sql`datetime(${endDate})`,
                            ),
                        ),
                        and(
                            gte(
                                sql`datetime(${u.startDate} || ' ' || ${u.startTime})`,
                                sql`datetime(${startDate})`,
                            ),
                            lte(
                                sql`datetime(${u.startDate} || ' ' || ${u.startTime})`,
                                sql`datetime(${endDate})`,
                            ),
                        ),
                        and(
                            gte(
                                sql`datetime(${u.endDate} || ' ' || ${u.endTime})`,
                                sql`datetime(${startDate})`,
                            ),
                            lte(
                                sql`datetime(${u.endDate} || ' ' || ${u.endTime})`,
                                sql`datetime(${endDate})`,
                            ),
                        ),
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

    let unavailabilites = apps.map(app => ({
        startDateTime: `${app.appointmentDate} ${app.startTime}`,
        endDateTime: `${app.appointmentDate} ${app.endTime}`,
        isAvailable: false,
    }));

    const unavResults = unavs.map(unav => ({
        startDateTime: `${unav.startDate} ${unav.startTime}`,
        endDateTime: `${unav.endDate} ${unav.endTime}`,
        isAvailable: false,
    }));

    unavailabilites = unavailabilites.concat(unavResults);

    unavailabilites = unavailabilites.sort((a, b) => {
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
    });

    // extrapolate the availabilities from the unavailabilities
    const availabilities = [];
    const date_format = "YYYY-MM-DD HH:mm:ss";
    if (unavailabilites.length === 0) {
        availabilities.push({
            startDateTime: startDate,
            endDateTime: endDate,
            isAvailable: true,
        });
    }
    else {
        let startDatejs = dayjs(startDate, date_format);
        const endDatejs = dayjs(endDate, date_format);

        for (const unavailability of unavailabilites) {
            const unavStart = dayjs(unavailability.startDateTime, date_format);
            const unavEnd = dayjs(unavailability.endDateTime, date_format);

            if (startDatejs.isSameOrAfter(unavStart) || unavEnd.isSameOrAfter(endDatejs)) {
                startDatejs = unavEnd;
                continue;
            }

            if (unavStart.isBefore(endDatejs)) {
                availabilities.push({
                    startDateTime: startDatejs.format(date_format),
                    endDateTime: unavailability.startDateTime,
                    isAvailable: true,
                });
            }

            startDatejs = unavEnd;
        }

        if (startDatejs.isBefore(endDatejs)) {
            availabilities.push({
                startDateTime: startDatejs.format(date_format),
                endDateTime: endDate,
                isAvailable: true,
            });
        }
    }

    let unAvAvs = availabilities.concat(unavailabilites);

    unAvAvs = unAvAvs.sort((a, b) => {
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
    });

    return c.json(unAvAvs, HttpStatusCodes.OK);
};
