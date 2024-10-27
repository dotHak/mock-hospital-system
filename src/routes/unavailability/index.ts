import createApp from "@/lib/create-app";
import { CreateRoute, ListRoute, UpdateRoute, GetOneRoute, DeleteRoute } from "./routes";
import { list, getOne, create, update, remove } from "./handlers";

export default createApp()
    .openapi(ListRoute, list)
    .openapi(GetOneRoute, getOne)
    .openapi(CreateRoute, create)
    .openapi(UpdateRoute, update)
    .openapi(DeleteRoute, remove);
