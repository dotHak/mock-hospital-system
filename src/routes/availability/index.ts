import createApp from "@/lib/create-app";

import { list } from "./handlers";
import { ListRoute } from "./routes";

export default createApp().openapi(ListRoute, list);
