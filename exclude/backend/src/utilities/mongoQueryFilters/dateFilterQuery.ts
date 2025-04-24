export interface DateFilter {
    date: {
        $gte: Date;
        $lte: Date;
    };
}

//TODO: c'est pas incroyable, vérif d'input avec middleware obligé
export const dateFilter = (input: { date?: any, startDate?: any, endDate?: any, }): DateFilter => {

    let start: Date;
    let end: Date;



    if (input.date) {
        const date: Date = new Date(input.date);
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
        const startDate: Date = new Date(input.startDate);
        const endDate: Date = new Date(input.endDate);

        start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0));
        end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999));

        return {
            date: {
                $gte: start,
                $lte: end
            }
        };
    }

    return {}

};
