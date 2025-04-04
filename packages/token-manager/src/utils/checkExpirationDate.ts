/**
 * Validates whether a date is not expired.
 *
 * @param input - a date.
 * @returns True if the date is valid (not expired), false otherwise.
 */
export type TCheckExpirationDateFunction = (input: { expirationDate: Date }) => boolean;

export const checkExpirationDate: TCheckExpirationDateFunction = (input) => {
    return input.expirationDate.getTime() > Date.now()
};
