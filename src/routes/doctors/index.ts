import {
    ListRoute,
    SearchRoute,
    GetOneRoute,
    CreateRoute,
    UpdateRoute,
    DeleteRoute,
} from "./routes";
import { list, search, getOne, create, update, remove } from "./handlers";
import createApp from "@/lib/create-app";

export default createApp()
    .openapi(ListRoute, list)
    .openapi(SearchRoute, search)
    .openapi(GetOneRoute, getOne)
    .openapi(CreateRoute, create)
    .openapi(UpdateRoute, update)
    .openapi(DeleteRoute, remove);
