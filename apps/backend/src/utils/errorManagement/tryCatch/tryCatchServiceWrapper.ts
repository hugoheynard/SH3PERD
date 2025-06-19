export function wrapServiceWithTryCatch<
  T extends Record<string, (...args: any[]) => Promise<any>>,
>(input: { service: T; serviceName: string }): T {
  const { service, serviceName } = input;

  const wrapped = {} as T;

  (Object.keys(service) as Array<keyof T>).forEach((key) => {
    const originalMethod = service[key];

    wrapped[key] = (async (
      ...args: Parameters<typeof originalMethod>
    ): Promise<ReturnType<typeof originalMethod>> => {
      try {
        return await originalMethod(...args);
      } catch (err) {
        const message = `[${serviceName} - ${String(key)}] ${
          err instanceof Error ? err.message : 'Unknown error'
        }`;
        throw new Error(message);
      }
    }) as T[typeof key];
  });

  return wrapped;
}
