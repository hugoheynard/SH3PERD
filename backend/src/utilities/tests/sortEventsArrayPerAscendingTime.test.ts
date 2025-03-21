import {sortEventsArrayPerAscendingTime} from "../sortEventsArrayPerAscendingTime";

describe('sortEventsArrayPerAscendingTime', () => {
    it('should return an empty array if the input is empty', () => {
        const result = sortEventsArrayPerAscendingTime([]);
        expect(result).toEqual([]);
    });

    it('should return the same array if there is only one event', () => {
        const singleEvent = [{ date: new Date('2024-11-22T12:00:00'), title: 'Event 1' }];
        const result = sortEventsArrayPerAscendingTime(singleEvent);
        expect(result).toEqual(singleEvent);
    });

    it('should sort planningBlocks in ascending order based on the date', () => {
        const events = [
            { date: new Date('2024-11-23T12:00:00'), title: 'Event 3' },
            { date: new Date('2024-11-21T12:00:00'), title: 'Event 2' },
            { date: new Date('2024-11-22T12:00:00'), title: 'Event 1' }
        ];

        const sortedEvents = sortEventsArrayPerAscendingTime(events);
        expect(sortedEvents[0].title).toBe('Event 2');
        expect(sortedEvents[1].title).toBe('Event 1');
        expect(sortedEvents[2].title).toBe('Event 3');
    });

    it('should return the same array if no valid dates are present', () => {
        const events = [
            { date: 'invalid date', title: 'Invalid Event 1' },
            { date: 'invalid date', title: 'Invalid Event 2' }
        ];

        const result = sortEventsArrayPerAscendingTime(events);
        expect(result).toEqual(events);  // No valid dates, so the array should remain unsorted
    });
});
