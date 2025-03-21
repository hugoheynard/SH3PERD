import {planningObjectBuilder} from "../builders/planningObjectBuilder";


describe('planningObjectBuilder', () => {
    it('must build planning object for several users', () => {
        // Mock des données
        const users = [
            { _id: '1', firstName: 'Alice', functions: { category: 'Engineer' } },
            { _id: '2', firstName: 'Bob', functions: { category: 'Manager' } },
        ];

        const events = [
            { _id: 'event1', participants: ['1', '2'] },
            { _id: 'event2', participants: ['1'] },
        ];


        const result = planningObjectBuilder({ users: users, calendarEvents: events });

        expect(result).toEqual([
            {
                staff_id: '1',
                userInformations: {
                    firstName: 'Alice',
                    functions: {
                        category: 'Engineer',
                    },
                },
                calendar_events: ['event1', 'event2'],
            },
            {
                staff_id: '2',
                userInformations: {
                    firstName: 'Bob',
                    functions: {
                        category: 'Manager',
                    },
                },
                calendar_events: ['event1'],
            },
        ]);
    });

    it('must manage users without planningBlocks', () => {
        // Mock des données
        const users = [
            { _id: '1', firstName: 'Alice', functions: { category: 'Engineer' } },
            { _id: '2', firstName: 'Bob', functions: { category: 'Manager' } },
        ];

        const calendarEvents = [
            { _id: 'event1', participants: ['1'] },
        ];

        const result = planningObjectBuilder({ users, calendarEvents });

        expect(result).toEqual([
            {
                staff_id: '1',
                userInformations:
                    {
                        firstName: 'Alice',
                        functions: {
                            category: 'Engineer',
                        },
                    },
                calendar_events: ['event1'],
            },
            {
                staff_id: '2',
                userInformations: {
                    firstName: 'Bob',
                    functions: {
                        category: 'Manager',
                    },
                },
                calendar_events: [],
            },
        ]);
    });

        it('must manage no event cases', () => {
            // Mock des données
            const users = [
                { _id: '1', firstName: 'Alice', functions: { category: 'Engineer' } },
                { _id: '2', firstName: 'Bob', functions: { category: 'Manager' } },
            ];

            const calendarEvents = [];

            const result = planningObjectBuilder({ users, calendarEvents });

            expect(result).toEqual([
                {
                    staff_id: '1',
                    userInformations:
                        {
                            firstName: 'Alice',
                            functions: {
                                category: 'Engineer',
                            },
                        },
                    calendar_events: [],
                },
                {
                    staff_id: '2',
                    userInformations: {
                        firstName: 'Bob',
                        functions: {
                            category: 'Manager',
                        },
                    },
                    calendar_events: [],
                },
            ]);
        });

        it('must return an empty array if no user passed', () => {
            const result = planningObjectBuilder({ users: [], calendarEvents: [] });
            expect(result).toEqual([]);
        });


});
