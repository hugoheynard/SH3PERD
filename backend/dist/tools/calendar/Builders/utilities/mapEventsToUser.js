export const mapEventsToUser = (input) => {
    const { events, user_id } = input;
    return events
        .filter((event) => {
        const participantsSet = new Set(event.participants.map((participant) => participant.toString()));
        return participantsSet.has(user_id);
    })
        .map((event) => event._id.toString());
};
//# sourceMappingURL=mapEventsToUser.js.map