export const wrap_TryCatchNextErr = (obj: any): any => {
    const wrappedObject: any = {};

    for (const key of Object.keys(obj)) {
        const method = obj[key];
        if (typeof method === 'function') {
            // Remplacer la méthode par une version enveloppée dans un try-catch
            wrappedObject[key] = async function (...args: any[]): Promise<void> {
                const [req, res, next] = args;
                try {
                    await method.apply(obj, args);
                } catch (err) {
                    next(err);
                }
            };
        } else {
            wrappedObject[key] = method;
        }
    }

    return wrappedObject;
};
