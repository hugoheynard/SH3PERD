import type {CalendarEventsObject} from "../../../../planningBlocks/interfaces_events/CalendarEventsObject";
import type {ObjectId} from "mongodb";

export const mapEventsToUser = (input: { events: CalendarEventsObject[], user_id: string}): string[] => {
    const { events, user_id } = input;

    return events
        .filter((event: CalendarEventsObject) => {
            const participantsSet: Set<string> = new Set(event.participants.map((participant: ObjectId) => participant.toString()));
            return participantsSet.has(user_id);
        })
        .map((event: CalendarEventsObject): string => event._id.toString());
};