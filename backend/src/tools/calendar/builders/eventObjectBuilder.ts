import type {CalendarEvent, CalendarEventsObject} from "../../../planningBlocks/interfaces_events/CalendarEventsObject";

export interface EventBuilderOutput {
    [key: string]: CalendarEventsObject;
}

export const eventObjectBuilder = (input: { events: CalendarEvent[] }): CalendarEventsObject => {
    try {
        if (!Array.isArray(input.events)) {
            throw new Error('Invalid input: planningBlocks should be an array');
        }

        return input.events
            .reduce<CalendarEventsObject>((acc, curr) => {
                if (!curr._id) {
                    throw new Error(`Invalid event: missing or null _id for event ${JSON.stringify(curr)}`);
                }
                acc[curr._id.toString()] = curr;
                return acc;}, {}
            );
    } catch(err: any) {
        console.error('Error building planningBlocks object:', {
            error: err.message,
            stack: err.stack,
            input,
        });
        return {};
    }
};