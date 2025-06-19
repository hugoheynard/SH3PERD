import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';

export const createGetCalendarUseCase = (deps: any) => {
  const { getEventUnitsFn, buildCalendarFn } = deps;

  return async (request: any): Promise<any> => {
    try {
      const { user_ids, startDate, endDate, context } = request;

      //1-get the events requested for users and dates
      const eventUnits = await getEventUnitsFn({
        user_ids,
        startDate,
        endDate,
      });

      //2-buildCalendar
      const calendar = buildCalendarFn({ eventUnits, user_ids, context });

      return calendar;
    } catch (error) {
      throw new TechnicalError('FAILED_TO_GET_CALENDAR', 'Failed to get calendar', 500);
    }
  };
};
