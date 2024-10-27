import createApp from "@/lib/create-app";
import { list, update, create, getOne, remove } from "./handlers";
import { ListRoute, CreateRoute, DeleteRoute, GetOneRoute, UpdateRoute } from "./routes";

export default createApp()
    .openapi(ListRoute, list)
    .openapi(GetOneRoute, getOne)
    .openapi(CreateRoute, create)
    .openapi(UpdateRoute, update)
    .openapi(DeleteRoute, remove);
