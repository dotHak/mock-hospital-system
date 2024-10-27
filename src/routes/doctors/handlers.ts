import { eq, sql } from "drizzle-orm";

import type {
  CreateRouteType,
  DeleteRouteType,
  GetOneRouteType,
  ListRouteType,
  SearchRouteType,
  UpdateRouteType,
} from "@/routes/doctors/routes";
import type { AppRouteHandler } from "@/types";

import { db } from "@/db/db";
import { doctors } from "@/db/schema";
import * as HttpStatusCodes from "@/http-status-codes";

import { filterUndedinedfields } from "../helpers";

export const list: AppRouteHandler<ListRouteType> = async (c) => {
  const result = await db.query.doctors.findMany();
  return c.json(result, HttpStatusCodes.OK);
};

export const search: AppRouteHandler<SearchRouteType> = async (c) => {
  const { name } = c.req.valid("query");
  const terms = name
    .split(" ")
    .map((term) => term.trim())
    .filter(Boolean);

  const result = await db.query.doctors.findFirst({
    where: (d, { and, like }) =>
      and(
        ...terms.map((term) =>
          // @ts-ignore
          like(sql`upper(${d.name})`, `%${term.toLowerCase()}%`),
        ),
      ),
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

  return c.json(result, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRouteType> = async (c) => {
  const { id } = c.req.valid("param");
  const result = await db.query.doctors.findFirst({
    where: (d, { eq }) => eq(d.id, id),
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

  return c.json(result, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRouteType> = async (c) => {
  const values = c.req.valid("json");
  const [result] = await db.insert(doctors).values(values).returning();

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

  const [result] = await db
    .update(doctors)
    .set(values)
    .where(eq(doctors.id, id))
    .returning();

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

  return c.json(result, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<DeleteRouteType> = async (c) => {
  const { id } = c.req.valid("param");
  const [result] = await db
    .delete(doctors)
    .where(eq(doctors.id, id))
    .returning({
      id: doctors.id,
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

  return c.json(
    {
      message: "Doctor deleted",
      id: result.id,
    },
    HttpStatusCodes.OK,
  );
};
