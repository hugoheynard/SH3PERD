import type {RequestHandler} from "express";
import {routerBuilder} from "../index.js";
import {defineModule} from "../infra/defineModule.js";


export const helloHandler: RequestHandler = (req, res) => {
    res.json({ message: 'Hello World' });
};

export const appendMwWithoutInjection: RequestHandler = (req, res, next) => {
    // Intercepte la méthode res.json pour la modifier
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (typeof body.message === 'string') {
            body.message += ' + mw without injection';
        }
        return originalJson(body);
    };
    next();
};

export const appendWithInjection = (deps: { suffix: string }): RequestHandler => {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (typeof body.message === 'string') {
                body.message += ' ' + deps.suffix;
            }
            return originalJson(body);
        };
        next();
    };
};

type HelloDeps = {
    inject: {}
    forMwInjection: {
        testFnToInject: () => string;
    };
    mw: {
        appendMwWithoutInjection: RequestHandler;
        appendWithInjection: (deps: { suffix: string }) => RequestHandler;
    };
};

type mwDepsType = {
    testFnToInject: () => string;
};

export const helloModule = defineModule<HelloDeps>({
    path: '/hello',
    inject: {
        /*
        suffix: 'from injected middleware',
        mw: {
            appendWithInjection,
            appendMwWithoutInjection,
        }

         */
    },
    routes: ({ suffix, mw }) => ({
        'get:/': {
            handler: helloHandler,
            /*
            mw: [
                mw.appendMwWithoutInjection,
                (deps: mwDepsType) => mw.appendWithInjection(deps)
            ]

             */
        },
        'post:/': {}
    })
});

export const helloModule2 = defineModule({
    path: '/hello',
    inject: {
        useCases: {
            helloHandler: helloHandler
        },
        mw: {
            mwWithInjection
        },
        utils: {
            forMwWithInjection: otherfunction
        }
        /*
        suffix: 'from injected middleware',
        mw: {
            appendWithInjection,
            appendMwWithoutInjection,
        }

         */
    },
    routes: ({ useCases, mw, utils }) => ({
        'get:/': [useCases.helloHandler],
        'post:/': {}
    })
});

await routerBuilder.build({ routeDefs: [helloModule]});