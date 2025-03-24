interface ParticipantsFilter {
    type: { $in: string[] }
}

export const eventTypeFilter = (input: { type?: string[]}): ParticipantsFilter | {} => {
    if (!Array.isArray(input.type) || input.type.length === 0) {
        return {};
    }

    return {
        type: { $in: input.type }
    };
}