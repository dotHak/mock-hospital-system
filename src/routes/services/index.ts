import createApp from "@/lib/create-app";

import { create, getOne, list, remove, update } from "./handlers";
import { CreateRoute, DeleteRoute, GetOneRoute, ListRoute, UpdateRoute } from "./routes";

export default createApp()
    .openapi(ListRoute, list)
    .openapi(GetOneRoute, getOne)
    .openapi(CreateRoute, create)
    .openapi(UpdateRoute, update)
    .openapi(DeleteRoute, remove);
