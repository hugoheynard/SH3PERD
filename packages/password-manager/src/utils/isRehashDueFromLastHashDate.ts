import type {TVerifyLastHashDateFunction} from "../types/Interfaces";


/**
 * Determines whether a password should be rehashed based on the age of the last hash.
 *
 * It calculates the number of days since the `lastHashDate` and compares it
 * to the `rehashAfterDays` threshold.
 *
 * @param input - An object containing:
 *   - `lastHashDate` (string): The ISO date string when the password was last hashed ex: '2025-12-31';
 *   - `rehashAfterDays` (number): The number of days after which a password should be rehashed
 *
 * @returns `true` if the hash is old enough to require rehashing, otherwise `false`.
 */
export const isRehashDueFromLastHashDate: TVerifyLastHashDateFunction = (input) => {
    const { lastHashDate, rehashAfterDays } = input;

    const parsedDate = new Date(lastHashDate);
    const now = new Date();

    // On force les dates à minuit (précision jour)
    parsedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - parsedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // important: floor

    return diffDays >= rehashAfterDays;
};

