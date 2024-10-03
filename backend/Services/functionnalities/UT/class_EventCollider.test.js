import {EventCollider} from "../class_EventCollider.js";


describe('class EventCollider', () => {



    //Constructor
    describe('constructor', ()=> {

        test('should initialize with valid events', () => {
            const validEvent1 = {
                date: new Date('2024-12-19T09:30:00.000Z'),
                duration: 30
            };

            const invalidDateEvent = {
                duration: 15
            };

            const validDateCollider = new EventCollider({referenceEvent: validEvent1, comparedEvent: validEvent1});

            expect(() => {
                new EventCollider({referenceEvent: validEvent1, comparedEvent: invalidDateEvent});
            }).toThrow(`event must have a non null date property, ${invalidDateEvent}`);
        });
    });

    //SUB Methods tests
    describe('method: getTimeStepsArray', () => {

        const validEvent1 = {
            date: new Date('2024-12-19T09:30:00.000Z'),
            duration: 15
        };

        const noDatePropEvent = {
            duration: 15
        };

        const validCollider = new EventCollider({referenceEvent: validEvent1, comparedEvent: validEvent1})

        const expectedResult = [
            new Date('2024-12-19T09:30:00.000Z'),
            new Date('2024-12-19T09:35:00.000Z'),
            new Date('2024-12-19T09:40:00.000Z'),
        ];


        test('should return an array from the startDate with increments of x minutes', () => {
            expect(validCollider.getTimeStepsArray(validEvent1)).toEqual(expectedResult);
        });
    });

    describe('method: getCollidingSteps', () => {

        test('should return an array of common steps between the two events', () => {

            const validEvent1 = {
                date: new Date('2024-12-19T09:30:00.000Z'),
                duration: 30
            };

            const validEvent2 = {
                date: new Date('2024-12-19T09:30:00.000Z'),
                duration: 15
            };

            const instance = new EventCollider({referenceEvent: validEvent1, comparedEvent: validEvent2});

            const result = instance.getCollidingSteps(validEvent1, validEvent2);
            const expected =   [new Date('2024-12-19T09:30:00.000Z'), new Date('2024-12-19T09:35:00.000Z'), new Date('2024-12-19T09:40:00.000Z')];


            expect(result).toEqual(expected);

        });
    });


    /*
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
    describe('method: getCollidingEvents', ()=> {
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
    */

})

