import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
    doctorsApi,
    appointmentsApi,
    servicesApi,
    unavailabilityApi,
    availabilityApi,
} from "@/routes";
import { AppBindings } from "@/types/app";
import { pinoLogger, serveEmojiFavicon, notFound, onError } from "@/middlewares";
import { apiReference } from "@scalar/hono-api-reference";
import defaultHook from "./middlewares/default-hook";

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
