import { defineConfig } from "drizzle-kit";

require("dotenv").config();

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./migrations",
    dialect: "turso",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN,
    },
});
