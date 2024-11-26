export const wrap_tryCatchNextErr = (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async (req, res, next) => {
        try {
            await originalMethod.apply(this, [req, res, next]);
        }
        catch (err) {
            next(err);
        }
    };
};
//# sourceMappingURL=TryCatchWrapper_nextErr.js.map