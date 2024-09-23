export const sortEventsArrayPerTime = array => {

    const faultyElements = array.filter(elem => !(elem.date instanceof Date));

    if (faultyElements.length > 0) {
        throw new Error(`Invalid elements found, property [date] value must be an instance of Date: ${JSON.stringify(faultyElements)}`);
    }

    return array.sort((a, b) => {
        // if same hour, compare minutes
        if (a.date.getHours() - b.date.getHours()) {
            return a.date.getHours() - b.date.getHours();
        }
        return a.date.getMinutes() - b.date.getMinutes();
    });
};

export const findEarliestEventInArray = array => {
    array.reduce((earliest, current) => {
        return new Date(current.date) < new Date(earliest.date) ? current : earliest;
    });
};