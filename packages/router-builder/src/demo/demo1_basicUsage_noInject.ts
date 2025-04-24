import type {RequestHandler} from "express";
import {routerBuilder} from "../index.js";
import {defineModule} from "../infra/defineModule.js";

export const helloHandler: RequestHandler = (req, res) => {
    res.json({ message: "Hello world" });
};

export const helloModule = defineModule({
    path: '/hello',
    inject: {},
    routes: () => ({
        'get:/': {
            handler: helloHandler
        }
    })
});

export const demo1_router = await routerBuilder.build({
    routeDefs: [helloModule]
});