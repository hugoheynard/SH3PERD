//TODO: c'est pas incroyable, vérif d'input avec middleware obligé
export const dateFilter = (input) => {
    let start;
    let end;
    if (input.date) {
        const date = new Date(input.date);
        start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
        end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
        return {
            date: {
                $gte: start,
                $lte: end
            }
        };
    }
    if (input.startDate && input.endDate) {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0));
        end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999));
        return {
            date: {
                $gte: start,
                $lte: end
            }
        };
    }
    return {};
};
//# sourceMappingURL=dateFilterQuery.js.map