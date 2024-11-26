export const eventObjectBuilder = (input) => {
    try {
        if (!Array.isArray(input.events)) {
            throw new Error('Invalid input: events should be an array');
        }
        return input.events
            .reduce((acc, curr) => {
            if (!curr._id) {
                throw new Error(`Invalid event: missing or null _id for event ${JSON.stringify(curr)}`);
            }
            acc[curr._id.toString()] = curr;
            return acc;
        }, {});
    }
    catch (err) {
        console.error('Error building events object:', {
            error: err.message,
            stack: err.stack,
            input,
        });
        return {};
    }
};
//# sourceMappingURL=eventObjectBuilder.js.map