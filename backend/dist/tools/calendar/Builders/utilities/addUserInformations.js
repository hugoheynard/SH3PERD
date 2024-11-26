export const addUserInformations = (user) => {
    return {
        firstName: user.firstName,
        functions: {
            category: user.functions ? user.functions.category : undefined
        }
    };
};
//# sourceMappingURL=addUserInformations.js.map