import {dateFilter} from "../../utilities/mongoQueryFilters/dateFilterQuery";
import {participantsFilter} from "../../utilities/mongoQueryFilters/participantsFilter";
import {eventTypeFilter} from "../../utilities/mongoQueryFilters/eventTypeFilter";


export interface TypeFilterQuery {
    type?: string;
    startDate?: Date;
    endDate?: Date;
    participants?: string[];
}

export const buildEventQuery = (queryParams: any): any => {
    const { type, date, startDate, endDate, participants } = queryParams;

    const filter = {
        ...eventTypeFilter({ type }),
        ...dateFilter({ date, startDate, endDate }),
        ...participantsFilter({ participants }),
    };

    return filter
};