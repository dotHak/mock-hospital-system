import createApp from "@/lib/create-app";
import { ListRoute } from "./routes";
import { list } from "./handlers";

export default createApp().openapi(ListRoute, list);
