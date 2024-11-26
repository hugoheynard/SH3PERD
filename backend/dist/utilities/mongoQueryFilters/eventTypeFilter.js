export const eventTypeFilter = (input) => {
    if (!Array.isArray(input.type) || input.type.length === 0) {
        return {};
    }
    return {
        type: { $in: input.type }
    };
};
//# sourceMappingURL=eventTypeFilter.js.map