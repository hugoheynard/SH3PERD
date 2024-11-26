export const eventObjectBuilder = (input) => {
    return input.calendarEvents
        .reduce((acc, curr) => {
        acc[curr._id.toString()] = curr;
        return acc;
    }, {});
};
//# sourceMappingURL=EventsBuilder.js.map