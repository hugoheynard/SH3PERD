export function wrapServiceWithTryCatch<T extends Record<string, (...args: any[]) => Promise<any>>>(input:{ service: T; serviceName: string }): T {
    const { service, serviceName } = input;

    const wrapped = {} as T;

    for (const key in service) {
        const originalMethod = service[key];

        wrapped[key] = (async (...args: any[]) => {
            try {
                return await originalMethod(...args);
            } catch (err) {
                const message = `[${serviceName} - ${key}] ${(err as Error).message}`;
                throw new Error(message);
            }
        }) as T[typeof key];
    }

    return wrapped;
}
