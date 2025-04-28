import type { RouteDef } from "../types/types";

export type HookCallback = (route: RouteDef) => void | Promise<void>;

export class RouterLifecycleHooks {
    private hooks: Partial<Record<string, HookCallback[]>> = {};

    private register(hookName: string, fns: HookCallback | HookCallback[]): this {
        const normalizedFns = Array.isArray(fns) ? fns : [fns];
        if (!this.hooks[hookName]) {
            this.hooks[hookName] = [];
        }
        this.hooks[hookName]!.push(...normalizedFns);
        return this;
    }

    useBeforeValidate(fn: HookCallback | HookCallback[]): this {
        return this.register("beforeValidate", fn);
    }

    useBeforeRegister(fn: HookCallback | HookCallback[]): this {
        return this.register("beforeRegister", fn);
    }

    useBeforeChildren(fn: HookCallback | HookCallback[]): this {
        return this.register("beforeChildren", fn);
    }

    useBeforeMount(fn: HookCallback | HookCallback[]): this {
        return this.register("beforeMount", fn);
    }

    async runHooks(hookName: string, route: RouteDef): Promise<void> {
        const fns = this.hooks[hookName] || [];
        for (const fn of fns) {
            await fn(route);
        }
    }
}
