import type {TEventPairs, TEventUnitDomainModel} from '@sh3pherd/shared-types';
import {EventIntersectionCollider} from "../EventIntersectionCollider";

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

describe('EventIntersectionCollider', () => {
    it('should detect intersecting events only', () => {
        const event1 = createEvent('A', 0, 60);    // 0 → 60
        const event2 = createEvent('B', 30, 60);   // 30 → 90 (intersect)
        const event3 = createEvent('C', 120, 60);  // 120 → 180 (no intersect)

        const collider = new EventIntersectionCollider();
        collider.addEvent(event1);
        collider.addEvent(event2);
        collider.addEvent(event3);

        const results = collider.execute();

        const ids = results.map(e => e.eventUnit_id).sort();

        expect(ids).toContain('eventUnit_B');
        expect(ids).not.toContain('eventUnit_C');
        expect(ids).not.toContain('eventUnit_A'); // A is used as reference only
        expect(results.length).toBe(1);
        expect(results[0].startDate.getTime()).toBe(event2.startDate.getTime());
    });

    it('should return an empty list if no intersections', () => {
        const event1 = createEvent('A', 0, 30);
        const event2 = createEvent('B', 60, 30);

        const collider = new EventIntersectionCollider();
        collider.addEvent(event1);
        collider.addEvent(event2);

        const results = collider.execute();

        expect(results).toHaveLength(0);
    });

    it('should detect full overlap where one event entirely contains another', () => {
        const event1 = createEvent('A', 0, 120);  // 0 → 120
        const event2 = createEvent('B', 30, 30);  // 30 → 60 (inside A)

        const collider = new EventIntersectionCollider();
        collider.addEvent(event1);
        collider.addEvent(event2);

        const results = collider.execute();

        expect(results).toHaveLength(1);
        expect(results[0].startDate.getTime()).toBe(event2.startDate.getTime());
        expect(results[0].endDate.getTime()).toBe(event2.endDate.getTime());
    });

    it('should not detect events that just touch at borders', () => {
        const event1 = createEvent('A', 0, 30);   // 0 → 30
        const event2 = createEvent('B', 30, 30);  // 30 → 60

        const collider = new EventIntersectionCollider();
        collider.addEvent(event1);
        collider.addEvent(event2);

        const results = collider.execute();

        expect(results).toHaveLength(0);
    });

    it('should skip pairs in the exclusion set', () => {
        const event1 = createEvent('A', 0, 60);
        const event2 = createEvent('B', 30, 60);

        const pairKey = [event1.eventUnit_id, event2.eventUnit_id].sort().join('-') as TEventPairs;

        const collider = new EventIntersectionCollider();
        collider['pairExclusionSet'].add(pairKey); // force une exclusion
        collider.addEvent(event1);
        collider.addEvent(event2);

        const results = collider.execute();

        expect(results).toHaveLength(0);
    });

    it('should throw if event is missing required fields', () => {
        const event = {
            eventUnit_id: undefined,
            startDate: new Date(),
            endDate: new Date(),
        } as unknown as TEventUnitDomainModel;
        const goodEvent = createEvent('A', 0, 30);

        const collider = new EventIntersectionCollider();
        collider.addEvent(event);
        collider.addEvent(goodEvent);

        expect(() => collider.execute()).toThrow(/missing required fields/i);
    });




});
