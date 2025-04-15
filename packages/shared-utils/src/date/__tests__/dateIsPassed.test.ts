import {dateIsPassed} from "../dateIsPassed";


describe('dateIsPassed', () => {

    it('should return true if date is not passed', () => {
        const validDate: Date = new Date(Date.now() + 1000 * 60 * 10);

        expect(dateIsPassed({ date: validDate })).toBe(true)
    });

    it('should return false if date is passed', () => {
        const invalidDate: Date = new Date(Date.now() - 1000 * 60 * 10);

        expect(dateIsPassed({ date: invalidDate })).toBe(false)
    });
});
