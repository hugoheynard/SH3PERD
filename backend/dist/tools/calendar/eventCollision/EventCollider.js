import { addMinutes } from "../../../utilities/dateFunctions/date_functions.js";
export class EventCollider {
    referenceEvent;
    comparedEvent;
    _collide;
    _result;
    constructor(input) {
        const { referenceEvent, comparedEvent } = input;
        if (!referenceEvent?.date || !comparedEvent?.date) {
            throw new Error(`Both events must have a valid 'date' property.`);
        }
        this.referenceEvent = referenceEvent;
        this.comparedEvent = comparedEvent;
        this.processCollisionTest();
    }
    /**
     * @returns {boolean} Whether the events collide.
     */
    get collide() {
        return this._collide;
    }
    set collide(value) {
        this._collide = value;
    }
    /**
     * @returns {Object} The result of the collision test.
     */
    get result() {
        return this._result;
    }
    processCollisionTest() {
        const refStart = new Date(this.referenceEvent.date);
        const refEnd = addMinutes(refStart, this.referenceEvent.duration);
        const compStart = new Date(this.comparedEvent.date);
        const compEnd = addMinutes(compStart, this.comparedEvent.duration);
        // Determine if the events overlap
        this.collide = refStart < compEnd && compStart < refEnd;
        // Construct the result object
        this._result = {
            referenceEvent: this.referenceEvent._id.toString(),
            comparedToEvent: this.comparedEvent._id.toString(),
            collision_id: [this.referenceEvent._id, this.comparedEvent._id].sort().join('-'),
            collide: this.collide,
        };
        if (this.collide) {
            const collisionStart = refStart > compStart ? refStart : compStart;
            const collisionEnd = refEnd < compEnd ? refEnd : compEnd;
            const collisionDuration = (collisionEnd.getTime() - collisionStart.getTime()) / (60 * 1000);
            this.result.collisionEvent = {
                ...this.comparedEvent,
                date: collisionStart,
                duration: collisionDuration,
            };
        }
    }
    ;
    /**
     * Static method to generate a collision object without recalculating collision state.
     * @returns {Object} Collision result without recalculating the full collision state.
     */
    static createCollisionElement(referenceEvent, comparedEvent) {
        const refStart = new Date(referenceEvent.date);
        const refEnd = addMinutes(refStart, referenceEvent.duration);
        const compStart = new Date(comparedEvent.date);
        const compEnd = addMinutes(compStart, comparedEvent.duration);
        const collide = refStart < compEnd && compStart < refEnd;
        const result = {
            referenceEvent: referenceEvent._id.toString(),
            comparedToEvent: comparedEvent._id.toString(),
            collision_id: [referenceEvent._id, comparedEvent._id].sort().join('-'),
            collide,
        };
        if (collide) {
            const collisionStart = refStart > compStart ? refStart : compStart;
            const collisionEnd = refEnd < compEnd ? refEnd : compEnd;
            const collisionDuration = (collisionEnd.getTime() - collisionStart.getTime()) / (60 * 1000);
            result.collisionEvent = {
                ...comparedEvent,
                date: collisionStart,
                duration: collisionDuration,
            };
        }
        return result;
    }
}
//# sourceMappingURL=EventCollider.js.map