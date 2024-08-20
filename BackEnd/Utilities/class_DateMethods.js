/*Custom methods for datetime use*/
class DateMethod {
    static ONE_MINUTE_IN_MS = 60000;
    static differenceInMinutes(closestDate, furthestDate) {
        return (furthestDate - closestDate) / DateMethod.ONE_MINUTE_IN_MS;
    };
    static addMinutes(date, minutes){
        const newDate = new Date(date);
        newDate.setMinutes(newDate.getMinutes() + minutes);
        return newDate;
    };
    static substractMinutes = (date, minutes) => {
        const newDate = new Date(date);
        newDate.setMinutes(date.getMinutes() - minutes);
        return newDate;
    };
    static sameDates = (date1, date2) => date1.getTime() === date2.getTime();
    static addDays(date, days){
        let result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };
    static today = new Date(Date.now()).toISOString().split('T')[0]; // returns today's date in good format
    static inBetweenDates = (date, startDate, endDate) => date >= startDate && date <= endDate;
    static indexOfDay = date =>  new Date(date).getDay();
    static standardizeTime = time => {
        if (time.toString().length === 1) {
            return "0" + time;
        }
        return time;
    };
}

export {DateMethod};