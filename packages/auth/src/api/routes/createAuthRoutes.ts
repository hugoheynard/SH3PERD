import {routerBuilder} from "@sh3pherd/router-builder";
import {createRegisterRouter} from "./createRegisterRouter.js";

const createAuthRoutes = (input: {
    registerController: any;
    authController: any;

}) => {
    const { registerController, authController } = input;

    const routeDefs = [
        {
            path: "/auth",
            inject: {},
            children: [
                {
                    path: "/login",
                },
                {
                    path: "/logout",
                },
                {
                    path: "/register",
                    inject: {
                        registerUser: registerController.registerUser,
                        validateUserInput: registerController.validateRegisterInput
                    },
                    factory: createRegisterRouter,
                    middlewares: [
                        {
                            withDeps: true,
                            async: true,
                            deps: {},
                            mw: () => {}
                        }
                    ]
                }
            ]
        }
    ];







    return routerBuilder.build({ routeDefs})
}