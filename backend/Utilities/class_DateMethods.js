/*Custom methods for datetime use*/
class DateMethod {
    static ONE_MINUTE_IN_MS = 60000;
    static STEP_DURATION = 5;
    static ONE_DAY_IN_STEPS = 24 * 60 /DateMethod.STEP_DURATION
    static today = new Date(Date.now()).toISOString().split('T')[0]; // returns today's date in good format


    //PARAMETER VALIDATION
    static check_dateIsInstanceOfDate(date) {

        if (Array.isArray(date)) {
            const faulty = date.find(elem => !(elem instanceof Date))

            if (faulty) {
                throw new Error(`All the "date" elements must be an instance of Date`);
            }
            return;
        }

        if (!(date instanceof Date)) {
            throw new Error('The "date" parameter must be an instance of Date');
        }
    };
    static check_positiveIntegerParameter(number) {

        if (number < 0 || !Number.isInteger(number)) {
            throw new Error('parameter must be positive integer only');
        }
    };


    //TIME MANIPULATIONS
    static addMinutes(date, minutes){
        DateMethod.check_dateIsInstanceOfDate(date);
        DateMethod.check_positiveIntegerParameter(minutes);

        const newDate = new Date(date);
        newDate.setMinutes(newDate.getMinutes() + minutes);
        return newDate;
    };
    static substractMinutes(date, minutes){
        DateMethod.check_dateIsInstanceOfDate(date);
        DateMethod.check_positiveIntegerParameter(minutes);

        const newDate = new Date(date);
        newDate.setMinutes(date.getMinutes() - minutes);
        return newDate;
    };
    static addDays(date, days){
        DateMethod.check_dateIsInstanceOfDate(date);
        DateMethod.check_positiveIntegerParameter(days);

        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);

        return newDate;
    };
    static startOfDay(date) {
        DateMethod.check_dateIsInstanceOfDate(date);

        return new Date(date.setHours(0, 0, 0, 0));
    };
    static endOfDay(date) {
        DateMethod.check_dateIsInstanceOfDate(date);

        return DateMethod.addDays(DateMethod.startOfDay(date), 1);
    };

    static roundedTime(time, nearest = DateMethod.STEP_DURATION) {
        return (Math.round(time / nearest) * nearest) % 60;
    };

    //TIME COMPARISONS
    static differenceInMinutes(closestDate, furthestDate) {
        //DateMethod.check_dateIsInstanceOfDate([closestDate, furthestDate]);
        return (furthestDate - closestDate) / DateMethod.ONE_MINUTE_IN_MS;
    };
    static sameDates = (date1, date2) => {
        DateMethod.check_dateIsInstanceOfDate([date1, date2]);

        return date1.getTime() === date2.getTime();
    };
    static inBetweenDates = (date, startDate, endDate) => {
        DateMethod.check_dateIsInstanceOfDate([date, startDate, endDate]);
        return date >= startDate && date <= endDate;
    };
    static indexOfDay = date => {
        DateMethod.check_dateIsInstanceOfDate(date);

        return new Date(date).getDay()
    };

    //TIME LAYOUT
    static standardizeTime = time => {
        if (time.toString().length === 1) {
            return "0" + time;
        }
        return time;
    };
}

export {DateMethod};