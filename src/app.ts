import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";

import type { AppBindings } from "@/types/app";

import {
    notFound,
    onError,
    pinoLogger,
    serveEmojiFavicon,
} from "@/middlewares";
import {
    appointmentsApi,
    availabilityApi,
    doctorsApi,
    servicesApi,
    unavailabilityApi,
} from "@/routes";

const app = new OpenAPIHono<AppBindings>().basePath("/api");
app.use(pinoLogger());
app.use(serveEmojiFavicon("🏥"));

app.route("/doctors", doctorsApi);
app.route("/appointments", appointmentsApi);
app.route("/services", servicesApi);
app.route("/availability", availabilityApi);
app.route("/unavailability", unavailabilityApi);

app.doc31("/doc", {
    openapi: "3.1.0",
    info: {
        version: "1.0.0",
        title: "Mock Hospital Scheduling API",
    },
});

app.get(
    "/reference",
    apiReference({
        theme: "kepler",
        layout: "classic",
        defaultHttpClient: {
            targetKey: "python",
            clientKey: "requests",
        },
        spec: {
            url: "/api/doc",
        },
    }),
);

app.notFound(notFound);
app.onError(onError);

export default app;
