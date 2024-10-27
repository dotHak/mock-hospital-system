import createApp from "@/lib/create-app";
import { CreateRoute, ListRoute, GetOneRoute, UpdateRoute, DeleteRoute } from "./routes";
import { create, list, getOne, update, remove } from "./handlers";

export default createApp()
    .openapi(ListRoute, list)
    .openapi(GetOneRoute, getOne)
    .openapi(CreateRoute, create)
    .openapi(UpdateRoute, update)
    .openapi(DeleteRoute, remove);
