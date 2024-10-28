export class EventsBuilder {
    build(input) {
        return input.calendarEvents
            .reduce((acc, curr) => {
                acc[curr._id.toString()] = curr;
                return acc;
                }, {}
            );
    };
}