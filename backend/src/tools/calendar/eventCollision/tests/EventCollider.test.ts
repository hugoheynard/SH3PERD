import {EventCollider} from "../EventCollider";

describe('EventCollider', () => {
    it('should detect a collision when events overlap', () => {
        const refEvent = {
            _id: 'event1',
            date: new Date('2024-11-23T08:00:00'),
            duration: 120, // 2 hours
        };

        const compEvent = {
            _id: 'event2',
            date: new Date('2024-11-23T09:00:00'),
            duration: 90, // 1.5 hours
        };

        const collider = new EventCollider({referenceEvent: refEvent, comparedEvent: compEvent});

        expect(collider.collide).toBe(true);

        const expectedCollisionStart = new Date('2024-11-23T09:00:00');
        const expectedCollisionDuration = 60; // Overlap duration is 1 hour

        expect(collider.result).toEqual({
            referenceEvent: 'event1',
            comparedToEvent: 'event2',
            collision_id: 'event1-event2',
            collide: true,
            collisionEvent: {
                ...compEvent,
                date: expectedCollisionStart,
                duration: expectedCollisionDuration,
            },
        });
    });

    it('should detect no collision when events do not overlap', () => {
        const refEvent = {
            _id: 'event1',
            date: new Date('2024-11-23T08:00:00'),
            duration: 120, // 2 hours
        };

        const compEvent = {
            _id: 'event2',
            date: new Date('2024-11-23T11:00:00'),
            duration: 60, // 1 hour
        };

        const collider = new EventCollider({referenceEvent: refEvent, comparedEvent: compEvent});

        expect(collider.collide).toBe(false);

        expect(collider.result).toEqual({
            referenceEvent: 'event1',
            comparedToEvent: 'event2',
            collision_id: 'event1-event2',
            collide: false,
        });
    });

    it('should throw an error if an event is missing the date property', () => {
        const refEvent = {
            _id: 'event1',
            date: null,
            duration: 120,
        };

        const compEvent = {
            _id: 'event2',
            date: new Date('2024-11-23T11:00:00'),
            duration: 60,
        };

        expect(() => {
            new EventCollider({referenceEvent: refEvent, comparedEvent: compEvent});
        }).toThrowError("Both events must have a valid 'date' property.");
    });

    it('should correctly handle edge cases where events touch but do not overlap', () => {
        const refEvent = {
            _id: 'event1',
            date: new Date('2024-11-23T08:00:00'),
            duration: 120, // 2 hours
        };

        const compEvent = {
            _id: 'event2',
            date: new Date('2024-11-23T10:00:00'),
            duration: 60, // 1 hour
        };

        const collider = new EventCollider({referenceEvent: refEvent, comparedEvent: compEvent});

        expect(collider.collide).toBe(false);

        expect(collider.result).toEqual({
            referenceEvent: 'event1',
            comparedToEvent: 'event2',
            collision_id: 'event1-event2',
            collide: false,
        });
    });

    it('should handle events with identical start and duration', () => {
        const refEvent = {
            _id: 'event1',
            date: new Date('2024-11-23T08:00:00'),
            duration: 120,
        };

        const compEvent = {
            _id: 'event2',
            date: new Date('2024-11-23T08:00:00'),
            duration: 120,
        };

        const collider = new EventCollider({referenceEvent: refEvent, comparedEvent: compEvent});

        expect(collider.collide).toBe(true);

        const expectedCollisionStart = new Date('2024-11-23T08:00:00');
        const expectedCollisionDuration = 120; // Full overlap

        expect(collider.result).toEqual({
            referenceEvent: 'event1',
            comparedToEvent: 'event2',
            collision_id: 'event1-event2',
            collide: true,
            collisionEvent: {
                ...compEvent,
                date: expectedCollisionStart,
                duration: expectedCollisionDuration,
            },
        });
    });

    it('static - should correctly create a collision element for overlapping events', () => {
        const refEvent = {
            _id: 'event1',
            date: new Date('2024-11-23T08:00:00'),
            duration: 120, // 2 hours
        };

        const compEvent = {
            _id: 'event2',
            date: new Date('2024-11-23T09:00:00'),
            duration: 90, // 1.5 hours
        };

        const collisionResult = EventCollider.createCollisionElement(refEvent, compEvent);

        const expectedCollisionStart = new Date('2024-11-23T09:00:00');
        const expectedCollisionDuration = 60; // Overlap duration is 1 hour

        expect(collisionResult).toEqual({
            referenceEvent: 'event1',
            comparedToEvent: 'event2',
            collision_id: 'event1-event2',
            collide: true,
            collisionEvent: {
                ...compEvent,
                date: expectedCollisionStart,
                duration: expectedCollisionDuration,
            },
        });
    });
});
