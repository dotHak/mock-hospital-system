import { and, eq, gt, gte, lt, lte, not, or, sql } from "drizzle-orm";

import type { AppRouteHandler } from "@/types";

import { db } from "@/db/db";
import { appointments, unavailability } from "@/db/schema";
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
  const result = await db.query.appointments.findMany();
  return c.json(result, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRouteType> = async (c) => {
  const { id } = c.req.valid("param");
  const result = await db.query.appointments.findFirst({
    where: (a, { eq }) => eq(a.id, id),
    with: {
      doctor: true,
    },
  });

  if (!result) {
    return c.json(
      {
        message: "Appointment not found",
        success: false,
        code: HttpStatusCodes.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(result, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRouteType> = async (c) => {
  const values = c.req.valid("json");

  // check if the doctor id exists
  const doctor = await db.query.doctors.findFirst({
    where: (d, { eq }) => eq(d.id, values.doctorId),
    columns: {
      id: true,
    },
  });

  if (!doctor) {
    return c.json(
      {
        message: ` Doctor with id ${values.doctorId} not found`,
        success: false,
        code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  // check if the date is not in the past
  const [startHour, startMinute] = values.startTime.split(":").map(Number);
  const [endHour, endMinute] = values.endTime.split(":").map(Number);
  const startDate = new Date(values.appointmentDate).setHours(
    startHour,
    startMinute,
  );
  const endDate = new Date(values.appointmentDate).setHours(endHour, endMinute);

  if (startDate < Date.now()) {
    return c.json(
      {
        message: "Appointment date cannot be in the past",
        success: false,
        code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  if (endDate <= startDate) {
    return c.json(
      {
        message: "End time must be greater than start time",
        success: false,
        code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  // check if the doctor is available

  const startDateTime = `${values.appointmentDate} ${values.startTime}`;
  const endDateTime = `${values.appointmentDate} ${values.endTime}`;

  const slotsCounts = await db.transaction(async () => {
    const aCounts = await db.$count(
      appointments,
      and(
        eq(appointments.doctorId, values.doctorId),
        not(eq(appointments.status, "cancelled")),
        eq(
          sql`date(${appointments.appointmentDate})`,
          sql`date(${values.appointmentDate})`,
        ),
        or(
          and(
            lte(
              sql`time(${appointments.startTime})`,
              sql`time(${values.startTime})`,
            ),
            gt(
              sql`time(${appointments.endTime})`,
              sql`time(${values.startTime})`,
            ),
          ),
          and(
            lt(
              sql`time(${appointments.startTime})`,
              sql`time(${values.endTime})`,
            ),
            gte(
              sql`time(${appointments.endTime})`,
              sql`time(${values.endTime})`,
            ),
          ),
          and(
            gt(
              sql`time(${appointments.startTime})`,
              sql`time(${values.startTime})`,
            ),
            lt(
              sql`time(${appointments.endTime})`,
              sql`time(${values.endTime})`,
            ),
          ),
        ),
      ),
    );

    const uCounts = await db.$count(
      unavailability,
      and(
        eq(unavailability.doctorId, values.doctorId),
        eq(unavailability.frequency, "once"),
        or(
          and(
            lt(
              sql`datetime(${unavailability.startDate} || ' ' ||${unavailability.startTime})`,
              sql`datetime(${startDateTime})`,
            ),
            gt(
              sql`datetime(${unavailability.endDate} || ' ' ||${unavailability.endTime})`,
              sql`datetime(${endDateTime})`,
            ),
          ),
          and(
            lt(
              sql`datetime(${unavailability.startDate} || ' ' ||${unavailability.startTime})`,
              sql`datetime(${startDateTime})`,
            ),
            gte(
              sql`datetime(${unavailability.endDate} || ' ' ||${unavailability.endTime})`,
              sql`datetime(${endDateTime})`,
            ),
          ),
          and(
            gte(
              sql`datetime(${unavailability.startDate} || ' ' ||${unavailability.startTime})`,
              sql`datetime(${startDateTime})`,
            ),
            lt(
              sql`datetime(${unavailability.endDate} || ' ' ||${unavailability.endTime})`,
              sql`datetime(${endDateTime})`,
            ),
          ),
        ),
      ),
    );

    return aCounts + uCounts;
  });

  if (slotsCounts > 0) {
    return c.json(
      {
        message: "Doctor is not available at the specified time",
        success: false,
        code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [result] = await db.insert(appointments).values(values).returning();

  return c.json(result, HttpStatusCodes.CREATED);
};

export const update: AppRouteHandler<UpdateRouteType> = async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const values = filterUndedinedfields(body);

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

  const [result] = await db
    .update(appointments)
    .set(values)
    .where(eq(appointments.id, id))
    .returning();

  if (!result) {
    return c.json(
      {
        message: "Appointment not found",
        success: false,
        code: HttpStatusCodes.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(result, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<DeleteRouteType> = async (c) => {
  const { id } = c.req.valid("param");

  const [result] = await db
    .delete(appointments)
    .where(eq(appointments.id, id))
    .returning({
      id: appointments.id,
    });

  if (!result) {
    return c.json(
      {
        message: "Appointment not found",
        success: false,
        code: HttpStatusCodes.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    {
      message: "Appointment deleted successfully",
      id: result.id,
    },
    HttpStatusCodes.OK,
  );
};
