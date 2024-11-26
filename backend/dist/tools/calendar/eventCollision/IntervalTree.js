export class IntervalTree {
    intervals;
    midPoint;
    constructor(intervals) {
        if (!Array.isArray(intervals) || intervals.length === 0) {
            this.intervals = [];
            this.midPoint = 0;
            return;
        }
        this.intervals = intervals.sort((a, b) => a.start - b.start);
        this.midPoint = this.calculateMidPoint();
    }
    calculateMidPoint() {
        const mid = Math.floor(this.intervals.length / 2);
        return this.intervals[mid].start;
    }
    queryOverlap(queryInterval) {
        const result = [];
        for (const interval of this.intervals) {
            if (interval.end < queryInterval.start)
                continue;
            if (interval.start > queryInterval.end)
                break;
            result.push(interval);
        }
        return result;
    }
}
//# sourceMappingURL=IntervalTree.js.map