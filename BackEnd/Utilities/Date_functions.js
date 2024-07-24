const today = new Date(Date.now()).toISOString().split('T')[0]; // returns todays date in good format

//Compare two dates
const compareDates = (date1, date2) => date1.getTime() === date2.getTime();

const inBetweenDates = (date, startDate, endDate) => date >= startDate && date <= endDate;
const indexOfDay = date =>  new Date(date).getDay();


const addMinutes = (date, minutes) => {

    const newDate = new Date(date);

    newDate.setMinutes(newDate.getMinutes() + minutes);

    return newDate;

};
const substractMinutes = (date, minutes) => {

    const newDate = new Date(date);

    newDate.setMinutes(date.getMinutes() - minutes);

    return newDate;
}

const standardizeTime = time => {

    if (time.toString().length === 1) {

        return "0" + time;

    }

    return time;
};

const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}


export {
    compareDates,
    inBetweenDates,
    indexOfDay,
    today,
    addMinutes,
    substractMinutes,
    standardizeTime,
    addDays
};