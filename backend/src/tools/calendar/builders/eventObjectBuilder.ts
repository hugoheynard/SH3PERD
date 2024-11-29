import type {CalendarEvents_interface} from "../../../interfaces/CalendarEvents_interface";

export interface EventBuilderOutput {
    [key: string]: CalendarEvents_interface;
}

export const eventObjectBuilder = (input: { events: CalendarEvents_interface[] }): EventBuilderOutput => {
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
                return acc;}, {}
            );
    } catch(err: any) {
        console.error('Error building events object:', {
            error: err.message,
            stack: err.stack,
            input,
        });
        return {};
    }
};