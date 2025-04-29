import {isRehashDueFromLastHashDate} from "../isRehashDueFromLastHashDate.js";


describe('isLastHashDateValid', () => {
    const today = new Date();

    it('should return true if the hash date is older than rehashAfterDays', () => {
        const oldDate = new Date(today);
        oldDate.setDate(today.getDate() - 10);

        const result = isRehashDueFromLastHashDate({
            lastHashDate: oldDate.toISOString(),
            rehashAfterDays: 7,
        });

        expect(result).toBe(true);
    });

    it('should return false if the hash date is more recent than rehashAfterDays', () => {
        const recentDate = new Date(today);
        recentDate.setDate(today.getDate() - 3);

        const result = isRehashDueFromLastHashDate({
            lastHashDate: recentDate.toISOString(),
            rehashAfterDays: 7,
        });

        expect(result).toBe(false);
    });

    it('should return true if the hash date is exactly rehashAfterDays ago', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exactDate = today;
        exactDate.setDate(today.getDate() - 7);

        const result = isRehashDueFromLastHashDate({
            lastHashDate: exactDate.toISOString(),
            rehashAfterDays: 7,
        });

        expect(result).toBe(true);
    });

    it('should handle invalid date strings gracefully (optional)', () => {
        const result = isRehashDueFromLastHashDate({
            lastHashDate: 'invalid-date',
            rehashAfterDays: 7,
        });

        expect(result).toBe(false); // ou throw si tu préfères lever une erreur
    });
});
