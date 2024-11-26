import { ObjectId } from "mongodb";
export const participantsFilter = (input) => {
    if (!Array.isArray(input.participants) || input.participants.length === 0) {
        return {};
    }
    const objectIds = input.participants.map((id) => new ObjectId(id));
    return {
        participants: { $in: objectIds }
    };
};
//# sourceMappingURL=participantsFilter.js.map