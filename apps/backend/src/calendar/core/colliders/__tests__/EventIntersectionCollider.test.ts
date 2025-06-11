import type { TEventPairs, TEventUnitDomainModel } from '@sh3pherd/shared-types';
import { EventIntersectionCollider } from '../computeEventIntersection';

const createEvent = (
    idSuffix: string,
    startOffsetMin: number,
    durationMin: number
): TEventUnitDomainModel => {
    const now = new Date();
    const start = new Date(now.getTime() + startOffsetMin * 60 * 1000);
    const end = new Date(start.getTime() + durationMin * 60 * 1000);

    return {
        eventUnit_id: `eventUnit_${idSuffix}`,
        startDate: start,
        endDate: end,
        participants: ['user_1'],
    } as unknown as TEventUnitDomainModel;
};

describe('EventIntersectionCollider (class-based)', () => {
    it('should detect intersecting events only', () => {
        const event1 = createEvent('A', 0, 60);
        const event2 = createEvent('B', 30, 60);
        const event3 = createEvent('C', 120, 60);

        const collider = new EventIntersectionCollider();
        collider.setContext({ eventIntersection: { target_id: 'user_1', intersectsWith: ['user_1'] } });
        collider.addEvent(event1);
        collider.addEvent(event2);
        collider.addEvent(event3);

        const results = collider.execute();

        expect(results.size).toBe(1);
        const values = Array.from(results.values());
        expect(values[0].startDate.getTime()).toBe(event2.startDate.getTime());
    });

    it('should return an empty map if no intersections', () => {
        const event1 = createEvent('A', 0, 30);
        const event2 = createEvent('B', 60, 30);

        const collider = new EventIntersectionCollider();
        collider.setContext({ eventIntersection: { target_id: 'user_1', intersectsWith: ['user_1'] } });
        collider.addEvent(event1);
        collider.addEvent(event2);

        const results = collider.execute();

        expect(results.size).toBe(0);
    });

    it('should detect full overlap where one event entirely contains another', () => {
        const event1 = createEvent('A', 0, 120);
        const event2 = createEvent('B', 30, 30);

        const collider = new EventIntersectionCollider();
        collider.setContext({ eventIntersection: { target_id: 'user_1', intersectsWith: ['user_1'] } });
        collider.addEvent(event1);
        collider.addEvent(event2);

        const results = collider.execute();
        const collision = Array.from(results.values())[0];

        expect(results.size).toBe(1);
        expect(collision.startDate.getTime()).toBe(event2.startDate.getTime());
        expect(collision.endDate.getTime()).toBe(event2.endDate.getTime());
    });

    it('should not detect events that just touch at borders', () => {
        const event1 = createEvent('A', 0, 30);
        const event2 = createEvent('B', 30, 30);

        const collider = new EventIntersectionCollider();
        collider.setContext({ eventIntersection: { target_id: 'user_1', intersectsWith: ['user_1'] } });
        collider.addEvent(event1);
        collider.addEvent(event2);

        const results = collider.execute();

        expect(results.size).toBe(0);
    });



    it('should throw if event is missing required fields', () => {
        const event = {
            eventUnit_id: undefined,
            startDate: new Date(),
            endDate: new Date(),
            participants: ['user_1'],
        } as unknown as TEventUnitDomainModel;

        const goodEvent = createEvent('A', 0, 30);

        const collider = new EventIntersectionCollider();
        collider.setContext({ eventIntersection: { target_id: 'user_1', intersectsWith: ['user_1'] } });
        collider.addEvent(event);
        collider.addEvent(goodEvent);

        expect(() => collider.execute()).toThrow(/missing required fields/i);
    });
});
