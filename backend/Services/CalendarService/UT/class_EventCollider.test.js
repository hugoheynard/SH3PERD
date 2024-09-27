import {EventCollider} from "../class_EventCollider.js";


describe('class EventCollider', () => {
    //const mockup

    const eventCollider = new EventCollider()

    //Constructor
    describe('constructor', ()=> {

    });

    //SUB Methods tests
    describe('method: getTimeStepsArray', () => {

        const validEvent = {
            date: new Date('2024-12-19T09:30:00.000Z'),
            duration: 15
        };

        const noDatePropEvent = {
            duration: 15
        }

        const expectedResult = [
            new Date('2024-12-19T09:30:00.000Z'),
            new Date('2024-12-19T09:35:00.000Z'),
            new Date('2024-12-19T09:40:00.000Z'),
        ]

        test('should return an error if event parameter does not have a date property', ()=> {
            expect(() => eventCollider.getTimeStepsArray(noDatePropEvent).toThrow('event must have a non null date property'))
        });

        test('should return an array from the startDate with increments of x minutes', () => {
            expect(eventCollider.getTimeStepsArray(validEvent)).toEqual(expectedResult);
        });
    });

    describe('method: blockCollide', () => {
        const event1 = {
            date: new Date('2024-12-19T09:30:00.000Z'),
            duration: 15
        }

        const event2_match = {
            date: new Date('2024-12-19T09:30:00.000Z'),
            duration: 15
        }

        const event2_noMatch = {
            date: new Date('2024-12-19T09:45:00.000Z'),
            duration: 15
        }

        test('should return true if two events share a timeStep', ()=> {
            expect(eventCollider.blockCollide(event1, event2_match)).toBe(true);
            expect(eventCollider.blockCollide(event1, event2_noMatch)).toBe(false);
        });
    });

    describe('method: getCollingEvents', ()=> {
        const baseEvent = {
            date: new Date('2024-12-19T09:30:00.000Z'),
            duration: 15
        }

        const eventToCompare1_collide = {
            date: new Date('2024-12-19T09:35:00.000Z'),
            duration: 15
        }

        const eventToCompare2_dontCollide = {
            date: new Date('2024-12-19T09:45:00.000Z'),
            duration: 15
        }

        test('should return an array of collidingEvents', ()=> {
            const result = eventCollider.getCollidingEvents(baseEvent, [eventToCompare1_collide, eventToCompare2_dontCollide]);

            expect(result).toEqual([eventToCompare1_collide]);
        });


    });
})

