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
