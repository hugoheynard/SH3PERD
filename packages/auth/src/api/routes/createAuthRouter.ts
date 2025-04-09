import type {Router} from "express";
import {routerBuilder} from "@sh3pherd/routeTree-builder";
import {validateAuthInput} from "../middlewares/login/validateAuthInput";


export const createAuthRouter = (input: { authController: any }): Router => {
        const { authController } = input;

        return routerBuilder.build({
            routeDefs: [
                {
                    path: '/auth',
                    inject: {},
                    factory: () => Router(),
                    children: [
                        {
                            path: '/login',
                            inject: { loginFunction: authController.login },
                            factory: () => Router(),
                            middlewares: [validateAuthInput]
                        },
                        {
                            path: '/logout',
                            inject: { logoutFunction: authController.logout },
                            factory: () => Router(),
                            middlewares: [
                                middleware1,
                                {
                                    mw: middleware2,
                                    withDeps: true,
                                    async: true,
                                    deps: { message: 'Injected into middleware2' },
                                },
                            ]

                        }
                    ]
                },
            ]
        });
}

app.use('/api', createAuthRouter({}));