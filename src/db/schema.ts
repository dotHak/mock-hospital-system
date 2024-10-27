import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const doctors = sqliteTable("doctors", {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    title: text().notNull(),
    link: text().notNull(),
    profile: text(),
    phone: text(),
    email: text(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const InsertDoctorSchema = createInsertSchema(doctors, {
    name: z => z.name.min(1),
    title: z => z.title.min(1),
    link: z => z.link.url(),
    email: z => z.email.email(),
}).omit({
    createdAt: true,
    id: true,
});
export const SelectDoctorSchema = createSelectSchema(doctors);

export const doctorRelations = relations(doctors, ({ many }) => ({
    appointments: many(appointments),
    unavailabilities: many(unavailability),
    serviceDoctors: many(serviceDoctors, { relationName: "doctor" }),
}));

export const services = sqliteTable("services", {
    id: integer().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    context: text().notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const InsertServiceSchema = createInsertSchema(services, {
    title: z => z.title.min(1),
    context: z => z.context.min(1),
}).omit({
    id: true,
    createdAt: true,
});
export const SelectServiceSchema = createSelectSchema(services);

export const serviceRelations = relations(services, ({ many }) => ({
    serviceDoctors: many(serviceDoctors, { relationName: "service" }),
}));

export const serviceDoctors = sqliteTable("service_doctors", {
    id: integer().primaryKey({ autoIncrement: true }),
    serviceId: integer("service_id")
        .notNull()
        .references(() => services.id, { onDelete: "cascade" }),
    doctorId: integer("doctor_id")
        .notNull()
        .references(() => doctors.id, { onDelete: "cascade" }),
});

export const InsertServiceDoctorSchema = createInsertSchema(serviceDoctors);
export const SelectServiceDoctorSchema = createSelectSchema(serviceDoctors);

export const doctorServiceRelations = relations(serviceDoctors, ({ one }) => ({
    service: one(services, {
        fields: [serviceDoctors.serviceId],
        references: [services.id],
        relationName: "service",
    }),
    doctor: one(doctors, {
        fields: [serviceDoctors.doctorId],
        references: [doctors.id],
        relationName: "doctor",
    }),
}));

export const appointments = sqliteTable("appointments", {
    id: integer().primaryKey({ autoIncrement: true }),
    doctorId: integer("doctor_id")
        .notNull()
        .references(() => doctors.id, { onDelete: "cascade" }),
    patientName: text("patient_name").notNull(),
    email: text().notNull(),
    reason: text(),
    appointmentDate: text("appointment_date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    status: text().default("booked"),
    createdAt: text().default(sql`CURRENT_TIMESTAMP`),
});

export const InsertAppointmentSchema = createInsertSchema(appointments, {
    patientName: z => z.patientName.min(1),
    email: z => z.email.email(),
    reason: z => z.reason.min(1),
    appointmentDate: z => z.appointmentDate.date(),
    startTime: z => z.startTime.time(),
    endTime: z => z.endTime.time(),
    status: z.enum(["booked", "cancelled", "completed", "rescheduled"]),
}).omit({
    createdAt: true,
    id: true,
});

export const SelectAppointmentSchema = createSelectSchema(appointments);

export const appointmentRelations = relations(appointments, ({ one }) => ({
    doctor: one(doctors, {
        fields: [appointments.doctorId],
        references: [doctors.id],
    }),
}));

export const unavailability = sqliteTable("unavailability", {
    id: integer().primaryKey({ autoIncrement: true }),
    doctorId: integer("doctor_id")
        .notNull()
        .references(() => doctors.id, { onDelete: "cascade" }),
    startDate: text("start_date").notNull(),
    startTime: text("start_time").notNull().default("00:00:00"),
    endDate: text("end_date").notNull(),
    endTime: text("end_time").notNull().default("23:59:59"),
    frequency: text().notNull(),
    reason: text(),
    createdAt: text().default(sql`CURRENT_TIMESTAMP`),
});

export const InsertUnavailabilitySchema = createInsertSchema(unavailability, {
    startDate: z => z.startDate.date(),
    endDate: z => z.endDate.date(),
    startTime: z => z.startTime.time().optional(),
    endTime: z => z.endTime.time().optional(),
    frequency: z.enum(["once", "daily", "weekly", "monthly"]),
    reason: z => z.reason.min(1),
}).omit({
    id: true,
    createdAt: true,
});
export const SelectUnavailabilitySchema = createSelectSchema(unavailability);

export const unavailabilityRelations = relations(unavailability, ({ one }) => ({
    doctor: one(doctors, {
        fields: [unavailability.doctorId],
        references: [doctors.id],
    }),
}));
