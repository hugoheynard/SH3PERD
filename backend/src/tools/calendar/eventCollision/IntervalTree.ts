import type {CalendarEvent} from "../../../interfaces/CalendarEvent";

export interface Interval {
    id: string;
    start: number;
    end: number;
    event: CalendarEvent
}

export class IntervalTree {
    private readonly intervals: any[];
    private midPoint: number;

    constructor(intervals: any[]) {
        if (!Array.isArray(intervals) || intervals.length === 0) {
            this.intervals = [];
            this.midPoint = 0;
            return;
        }

        this.intervals = intervals.sort((a, b) => a.start - b.start);
        this.midPoint = this.calculateMidPoint();
    }

    calculateMidPoint(): number {
        const mid = Math.floor(this.intervals.length / 2);
        return this.intervals[mid].start;
    }

    queryOverlap(queryInterval: { start: number; end: number }): Interval[] {
        const result: Interval[] = [];
        for (const interval of this.intervals) {
            if (interval.end < queryInterval.start) continue;
            if (interval.start > queryInterval.end) break;
            result.push(interval);
        }
        return result;
    }
}