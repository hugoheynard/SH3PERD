/**
 * Validates whether a date is not expired.
 *
 * @param input - a date.
 * @returns True if the date is valid (not expired/passed), false otherwise.
 */
export type TDateIsNotPassed = (input: { date: Date }) => boolean;
export const dateIsNotPassed: TDateIsNotPassed = (input) => {
    return input.date.getTime() > Date.now();
};