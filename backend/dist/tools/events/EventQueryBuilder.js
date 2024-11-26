import { dateFilter } from "../../utilities/mongoQueryFilters/dateFilterQuery.js";
import { participantsFilter } from "../../utilities/mongoQueryFilters/participantsFilter.js";
import { eventTypeFilter } from "../../utilities/mongoQueryFilters/eventTypeFilter.js";
export const buildEventQuery = (queryParams) => {
    const { type, date, startDate, endDate, participants } = queryParams;
    const filter = {
        ...eventTypeFilter({ type }),
        ...dateFilter({ date, startDate, endDate }),
        ...participantsFilter({ participants }),
    };
    return filter;
};
//# sourceMappingURL=EventQueryBuilder.js.map