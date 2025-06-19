import { dateIsNotPassed } from '../dateIsNotPassed.js';

describe('dateIsPassed', () => {
  it('should return true if date is not passed', () => {
    const validDate: Date = new Date(Date.now() + 1000 * 60 * 10);

    expect(dateIsNotPassed({ date: validDate })).toBe(true);
  });

  it('should return false if date is passed', () => {
    const invalidDate: Date = new Date(Date.now() - 1000 * 60 * 10);

    expect(dateIsNotPassed({ date: invalidDate })).toBe(false);
  });
});
