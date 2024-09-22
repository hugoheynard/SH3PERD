import {DateMethod} from "../class_DateMethods.js";

describe ('class DateMethods', () => {
    const inputDate = new Date('2024-01-01T00:00:00');

    describe('Method - addMinutes', () => {

        test('throws an error if "minutes" parameter <= 0', ()=> {
            expect(()=> DateMethod.addMinutes(inputDate,0)).toThrow('minutes parameter must be positive integer only');
            expect(()=> DateMethod.addMinutes(inputDate,-1)).toThrow('minutes parameter must be positive integer only');
            expect(()=> DateMethod.addMinutes(inputDate, 1.5)).toThrow('minutes parameter must be positive integer only');
        });

        test('should return an instance of date incremented by a number of minutes', ()=> {

            const timeToAdd = 5;
            const expectedDate = new Date('2024-01-01T00:05:00');

            const result = DateMethod.addMinutes(inputDate, timeToAdd);

            expect(result).toEqual(expectedDate);
            expect(result).toBeInstanceOf(Date)
        });
    })

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