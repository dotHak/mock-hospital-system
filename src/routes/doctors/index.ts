import createApp from "@/lib/create-app";

import { create, getOne, list, remove, search, update } from "./handlers";
import {
    CreateRoute,
    DeleteRoute,
    GetOneRoute,
    ListRoute,
    SearchRoute,
    UpdateRoute,
} from "./routes";

export default createApp()
    .openapi(ListRoute, list)
    .openapi(SearchRoute, search)
    .openapi(GetOneRoute, getOne)
    .openapi(CreateRoute, create)
    .openapi(UpdateRoute, update)
    .openapi(DeleteRoute, remove);
