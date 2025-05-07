/**
 * Validates whether a date is not expired.
 *
 * @param input - a date.
 * @returns True if the date is valid (not expired/passed), false otherwise.
 */
export const dateIsNotPassed  = (input: { date: Date }): boolean => {
    return input.date.getTime() > Date.now();
};