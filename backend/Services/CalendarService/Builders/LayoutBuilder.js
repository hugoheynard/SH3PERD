import {DateMethod} from "../../../Utilities/class_DateMethods.js";

export class LayoutBuilder {
    getTotalRowsNumber(timestamps) {
        return DateMethod.differenceInMinutes(new Date(timestamps.earliestEventTimestamp), new Date(timestamps.latestEventTimestamp)) / DateMethod.STEP_DURATION
    };

    getOffsetFromDayStart(timestamps) {
        return (timestamps.earliestEventTimestamp - timestamps.dayStartTimestamp) / (DateMethod.ONE_MINUTE_IN_MS * DateMethod.STEP_DURATION) - 1
    };

    getPlanningsColumnNumber(internalCollisions) {
        const planningColumnNumbers = Object.fromEntries(
            Object.entries(internalCollisions)
                .map(([key, planningCollision]) => [
                    key, (1 + planningCollision.maxCollisions) * 2
                ])
        );
        return Math.max(...Object.values(planningColumnNumbers));
    };

    getPlanningGridCoordinates(plannings, planningColumnNumbers) {
        const indexObject = {};

        for (const planning of plannings) {
            const baseIndex = plannings.indexOf(planning);

            indexObject[planning.staff_id] = {
                colIndex: baseIndex,
                maxIndex: baseIndex + planningColumnNumbers
            }
        }
        return indexObject;
    };

    build({ plannings, timestamps, internalCollisions }) {
        const planningColumnNumbers = this.getPlanningsColumnNumber(internalCollisions);

        return {
            gridRowsNumber: this.getTotalRowsNumber(timestamps),
            offsetFromDayStart: this.getOffsetFromDayStart(timestamps),
            gridTotalColNumber: planningColumnNumbers * plannings.length,
            planningsColNumber: planningColumnNumbers,
            planningsGridIndexes: this.getPlanningGridCoordinates(plannings, planningColumnNumbers)
        }
    };
}