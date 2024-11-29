import type {CalendarEvents_interface} from "../../../../interfaces/CalendarEvents_interface";
import type {ObjectId} from "mongodb";

export const mapEventsToUser = (input: { events: CalendarEvents_interface[], user_id: string}): string[] => {
    const { events, user_id } = input;

    return events
        .filter((event: CalendarEvents_interface) => {
            const participantsSet: Set<string> = new Set(event.participants.map((participant: ObjectId) => participant.toString()));
            return participantsSet.has(user_id);
        })
        .map((event: CalendarEvents_interface): string => event._id.toString());
};