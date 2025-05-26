import type {TEventPairs, TEventUnitDomainModel, TEventUnitId} from "../../types/eventUnits.domain.types.js";
import type {TEventIntersectionColliderContext} from "../services/CalendarService.js";


export const computeEventIntersections = (input: { eventUnits: readonly TEventUnitDomainModel[], context: TEventIntersectionColliderContext }): Map<TEventUnitId, TEventUnitDomainModel> => {
   const { eventUnits, context } = input;
    const { target_id, intersectsWith } = context || {};
    const eventCollisionMap = new Map<TEventUnitId, TEventUnitDomainModel>();
    const checkedPairs = new Set<TEventPairs>();

    if (!target_id && !intersectsWith?.length) {
        return eventCollisionMap;
    }

    const relevantEvents = eventUnits.filter(event =>
        (target_id && event.participants.includes(target_id)) ||
        (intersectsWith?.some(user => event.participants.includes(user)))
    );

    for (let i = 0; i < relevantEvents.length; i++) {
        for (let j = 0; j < relevantEvents.length; j++) {
            const a = relevantEvents[i];
            const b = relevantEvents[j];

            if (a.eventUnit_id === b.eventUnit_id) {
                continue;
            }

            const pairKey = [a.eventUnit_id, b.eventUnit_id].sort().join('-') as TEventPairs;
            if (checkedPairs.has(pairKey)) {
                continue;
            }

            if (!a.startDate || !a.endDate || !b.startDate || !b.endDate) {
                continue;
            }

            const overlap = a.endDate > b.startDate && b.endDate > a.startDate;

            if (!overlap) {
                continue;
            }

            const collisionStart = a.startDate > b.startDate ? a.startDate : b.startDate;
            const collisionEnd = a.endDate < b.endDate ? a.endDate : b.endDate;

            const { startDate, endDate, ...rest } = b;
            const intersected = {
                ...rest,
                startDate: collisionStart,
                endDate: collisionEnd,
            };

            checkedPairs.add(pairKey);
            eventCollisionMap.set(intersected.eventUnit_id, intersected);
        }
    }

    return eventCollisionMap;
}
