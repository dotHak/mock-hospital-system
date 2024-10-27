import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";

import allDoctors from "./doctors.json";
import allServices from "./services.json";
import { doctors, serviceDoctors, services } from "./src/db/schema.js";

function doctorNameMatch(doctorOneName: string, doctorTwoName: string) {
    const doctorOne = doctorOneName.split(" ").map(name => name.trim());
    const doctorTwo = doctorTwoName.split(" ").map(name => name.trim());

    return doctorOne.every(name => doctorTwo.includes(name));
}

async function seed() {
    const db = drizzle({
        connection: {
            url: process.env.DATABASE_URL!,
            authToken: process.env.DATABASE_AUTH_TOKEN,
        },
    });

    const returnedDoctors = await db
        .insert(doctors)
        .values(allDoctors)
        .returning({ id: doctors.id, name: doctors.name });
    console.log("=== Inserted users ===");

    const returnedServies = await db
        .insert(services)
        .values(allServices)
        .returning({ id: services.id, title: services.title });
    console.log("=== Inserted services ===");

    const serviceDoctorValues = allServices.flatMap((service, index) => {
        return service.doctors.map((doctor) => {
            const doc = returnedDoctors.find(d => doctorNameMatch(d.name, doctor.name));

            if (doc) {
                return {
                    serviceId: returnedServies[index].id,
                    doctorId: doc.id,
                };
            }
        });
    });

    const serviceDoctorValuesNo = serviceDoctorValues.filter(value => !!value);

    await db.insert(serviceDoctors).values(serviceDoctorValuesNo);
    console.log("=== Inserted service doctors ===");
}

seed().catch(console.error);
