import {IntervalTree} from "../eventCollision/IntervalTree";

describe('IntervalTree', () => {
    let intervals: any[];

    beforeEach(() => {
        intervals = [
            { start: 1, end: 5 },
            { start: 10, end: 15 },
            { start: 20, end: 25 },
            { start: 30, end: 35 },
        ];
    });

    test('constructor sort intervals properly', () => {
        const tree = new IntervalTree(intervals);
        expect(tree['intervals']).toEqual([
            { start: 1, end: 5 },
            { start: 10, end: 15 },
            { start: 20, end: 25 },
            { start: 30, end: 35 },
        ]);
    });

    test('calculateMidPoint gives correct midPoint', () => {
        const tree = new IntervalTree(intervals);
        expect(tree['midPoint']).toBe(20);
    });

    test('queryOverlap give intervals overlapping', () => {
        const tree = new IntervalTree(intervals);

        const result1 = tree.queryOverlap({ start: 12, end: 22 });
        expect(result1).toEqual([{ start: 10, end: 15 }, { start: 20, end: 25 }]);

        const result2 = tree.queryOverlap({ start: 0, end: 40 });
        expect(result2).toEqual(intervals);

        const result3 = tree.queryOverlap({ start: 40, end: 50 });
        expect(result3).toEqual([]);
    });

    test('queryOverlap works with limits', () => {
        const tree = new IntervalTree(intervals);

        const result = tree.queryOverlap({ start: 5, end: 10 });
        expect(result).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }]);
    });

    test('constructor manages empty array', () => {
        const tree = new IntervalTree([]);
        expect(tree['intervals']).toEqual([]);
        expect(tree['midPoint']).toBe(0);
    });
});