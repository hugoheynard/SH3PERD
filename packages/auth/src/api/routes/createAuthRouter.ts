import {Router} from "express";
import {createLoginRouter} from "./createLoginRouter";
import {validateAuthInput} from "../middlewares/validateAuthInput";
import {routerBuilder} from "@sh3pherd/router-builder";

/*
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
                            factory: ({ loginFunction }) => createLoginRouter({ loginFn: loginFunction }),
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

*/
//app.use('/api', createAuthRouter({}));

