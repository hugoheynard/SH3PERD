/*Custom methods for datetime use*/
export class DateMethod {
    static readonly ONE_MINUTE_IN_MS = 60000;
    static readonly STEP_DURATION = 5;
    static readonly ONE_DAY_IN_STEPS = 24 * 60 / DateMethod.STEP_DURATION
    static readonly today = new Date(Date.now()).toISOString().split('T')[0]; // returns today's date in good format


    //PARAMETER VALIDATION
    static check_positiveIntegerParameter(number: number): any {

        if (number < 0 || !Number.isInteger(number)) {
            throw new Error('parameter must be positive integer only');
        }
    };


    //TIME MANIPULATIONS
    static addMinutes(date: Date, minutes: number): Date {
        DateMethod.check_positiveIntegerParameter(minutes);

        const newDate = new Date(date);
        newDate.setMinutes(newDate.getMinutes() + minutes);
        return newDate;
    };

    static substractMinutes(date: Date, minutes: number): Date {
        DateMethod.check_positiveIntegerParameter(minutes);

        const newDate = new Date(date);
        newDate.setMinutes(date.getMinutes() - minutes);
        return newDate;
    };

    static addDays(date: Date, days: number): Date {
        DateMethod.check_positiveIntegerParameter(days);

        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);

        return newDate;
    };

    static startOfDay(date: Date): Date {
        return new Date(date.setHours(0, 0, 0, 0));
    };

    static endOfDay(date: Date): Date {
        return DateMethod.addDays(DateMethod.startOfDay(date), 1);
    };

    static roundedTime(time: number, nearest: number = DateMethod.STEP_DURATION): number {
        return (Math.round(time / nearest) * nearest) % 60;
    };

    //TIME COMPARISONS
    static differenceInMinutes(closestDate: number, furthestDate: number): number {
        return (furthestDate - closestDate) / DateMethod.ONE_MINUTE_IN_MS;
    };

    static sameDates = (date1: Date, date2: Date): boolean => {

        return date1.getTime() === date2.getTime();
    };
    static inBetweenDates = (date: Date, startDate: Date, endDate: Date): boolean => {
        return date >= startDate && date <= endDate;
    };
    static indexOfDay = (date: Date): number => {

        return new Date(date).getDay()
    };

    //TIME LAYOUT
    static standardizeTime(time: number): string {
        if (time.toString().length === 1) {
            return `0 ${time}`;
        }
        return time.toString();
    };
}
