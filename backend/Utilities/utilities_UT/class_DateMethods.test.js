import {DateMethod} from "../class_DateMethods.js";

describe ('class DateMethods', () => {
    const inputDate = new Date('2024-01-01T00:00:00');


    // check methods for input parameters validation
    describe ('Method - check_dateIsInstanceOfDate', () => {

        test('should throw an error if the date parameter is not an instance of Date', () => {
            const validSingleDate = new Date('2024-01-01T14:45:00');
            const unvalidSingleDate = '2024-01-01T00:00:00';

            const validArray = [new Date('2024-01-01T14:45:00'), new Date('2024-01-02T14:45:00')]
            const unvalidArray = [new Date('2024-01-01T14:45:00'), '2024-01-02T14:45:00']

            //check single date cases
            expect(() => DateMethod.check_dateIsInstanceOfDate(unvalidSingleDate))
                .toThrowError('The "date" parameter must be an instance of Date');

            expect(() => DateMethod.check_dateIsInstanceOfDate(validSingleDate))
                .not.toThrow();

            //check array of date cases
            expect(() => DateMethod.check_dateIsInstanceOfDate(unvalidArray))
                .toThrowError(`All the "date" elements must be an instance of Date`);

            expect(() => DateMethod.check_dateIsInstanceOfDate(validArray))
                .not.toThrow();
        });
    });
    describe('Method - check_positiveIntegerParameter', () => {

        test('throws an error if number parameter <= 0 or is not an integer', ()=> {
            const invalidValues = [0, -1, 1.5];
            const validValue = 2;

            // Test for invalid values
            for (const value of invalidValues) {
                expect(() => DateMethod.check_positiveIntegerParameter(value))
                    .toThrow('parameter must be positive integer only');
            }

            // Test for valid value
            expect(() => DateMethod.check_positiveIntegerParameter(validValue)).not.toThrow();
        });
    });


    //date methods
    describe('Method - addMinutes', () => {

        test('should return an instance of date incremented by a number of minutes', ()=> {

            const timeToAdd = 5;
            const expectedDate = new Date('2024-01-01T00:05:00');

            const result = DateMethod.addMinutes(inputDate, timeToAdd);

            expect(result).toEqual(expectedDate);
            expect(result).toBeInstanceOf(Date)
        });
    });
    describe('Method - substractMinutes', () => {

        test('should return an instance of date decremented by a number of minutes', ()=> {

            const timeToSub = 5;
            const expectedDate = new Date('2023-12-31T23:55:00');

            const result = DateMethod.substractMinutes(inputDate, timeToSub);

            expect(result).toEqual(expectedDate);
            expect(result).toBeInstanceOf(Date)
        });
    });
    describe('Method - addDays', () => {

        test('should return an instance of date incremented by a number of day', ()=> {

            const daysToAdd = 2;
            const expectedDate = new Date('2024-01-03T00:00:00');

            const result = DateMethod.addDays(inputDate, daysToAdd);

            expect(result).toEqual(expectedDate);
            expect(result).toBeInstanceOf(Date)
        });
    });
    describe ('Method - startOfDay', () => {
        test('should take a date and return the earliest time of the day (00:00:00)', () => {
            const inputDate = new Date('2024-01-01T14:45:00');
            const expectedDate = new Date('2024-01-01T00:00:00');

            const result = DateMethod.startOfDay(inputDate);

            expect(result).toEqual(expectedDate);
        });
    });
    describe ('Method - endOfDay', () => {
        test('should return the earliest time of the next day', () => {
            const expectedDate = new Date('2024-01-02T00:00:00');

            const result = DateMethod.endOfDay(inputDate);

            expect(result).toEqual(expectedDate);
        });
    });
});