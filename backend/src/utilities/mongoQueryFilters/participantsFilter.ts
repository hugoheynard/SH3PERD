import { ObjectId } from "mongodb";

interface ParticipantsFilter {
    participants: { $in: ObjectId[] }
}

export const participantsFilter = (input: { participants: string[]}): ParticipantsFilter => {
    const objectIds: ObjectId[] = input.participants.map((id: string) => new ObjectId(id));

    return {
       participants: { $in: objectIds }
    };
}