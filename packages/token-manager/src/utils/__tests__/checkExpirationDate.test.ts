import {checkExpirationDate} from "../checkExpirationDate";

describe('checkExpirationDate', () => {

    it('should return true if date is not passed', () => {
        const validDate: Date = new Date(Date.now() + 1000 * 60 * 10);

        expect(checkExpirationDate({ expirationDate: validDate })).toBe(true)
    })

    it('should return false if date is passed', () => {
        const invalidDate: Date = new Date(Date.now() - 1000 * 60 * 10);

        expect(checkExpirationDate({ expirationDate: invalidDate })).toBe(false)
    })
});
