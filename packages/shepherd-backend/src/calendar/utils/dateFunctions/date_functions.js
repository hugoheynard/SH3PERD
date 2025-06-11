export const invalidNumber = (number) => {
    return number < 0;
};
export const substractMinutes = (date, minutes) => {
    if (invalidNumber(minutes)) {
        throw new Error('Minutes must be >= 0');
    }
    return new Date(date.getTime() - minutes * 60 * 1000);
};
export const addMinutes = (date, minutes) => {
    if (invalidNumber(minutes)) {
        throw new Error('Minutes must be >= 0');
    }
    return new Date(date.getTime() + minutes * 60 * 1000);
};
export const startOfDay = (date) => {
    return new Date(date.setHours(0, 0, 0, 0));
};
export const endOfDay = (date) => {
    const ONE_DAY_IN_MINS = 24 * 60;
    return addMinutes(startOfDay(date), ONE_DAY_IN_MINS);
};
//# sourceMappingURL=date_functions.js.map