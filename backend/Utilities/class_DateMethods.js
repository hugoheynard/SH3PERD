/*Custom methods for datetime use*/
class DateMethod {
    static ONE_MINUTE_IN_MS = 60000;
    static STEP_DURATION = 5;
    static today = new Date(Date.now()).toISOString().split('T')[0]; // returns today's date in good format

    //TIME MANIPULATIONS
    static addMinutes(date, minutes){
        if (minutes <= 0 || !Number.isInteger(minutes)) {
            throw new Error('minutes parameter must be positive integer only');
        }

        const newDate = new Date(date);
        newDate.setMinutes(newDate.getMinutes() + minutes);
        return newDate;
    };
    static substractMinutes = (date, minutes) => {
        if (minutes <= 0 || !Number.isInteger(minutes)) {
            throw new Error('minutes parameter must be positive integer only');
        }

        const newDate = new Date(date);
        newDate.setMinutes(date.getMinutes() - minutes);
        return newDate;
    };
    static addDays(date, days){
        let result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };
    static roundedTime(time, nearest = DateMethod.STEP_DURATION) {
        return (Math.round(time / nearest) * nearest) % 60;
    };

    static startOfDay(date) {

        if (!date instanceof Date) {
            throw new Error('date parameter must be instance of Date');
        }

        return new Date(date.setHours(0, 0, 0, 0));
    };
    static endOfDay(date) {
        return DateMethod.addDays(DateMethod.startOfDay(date), 1);
    };

    //TIME COMPARISONS
    static differenceInMinutes(closestDate, furthestDate) {
        return (furthestDate - closestDate) / DateMethod.ONE_MINUTE_IN_MS;
    };
    static sameDates = (date1, date2) => {
        return date1.getTime() === date2.getTime();
    };
    static inBetweenDates = (date, startDate, endDate) => {
        return date >= startDate && date <= endDate;
    };
    static indexOfDay = date =>  new Date(date).getDay();

    //TIME LAYOUT
    static standardizeTime = time => {
        if (time.toString().length === 1) {
            return "0" + time;
        }
        return time;
    };
}

export {DateMethod};