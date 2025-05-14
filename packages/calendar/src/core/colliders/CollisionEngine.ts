import {EventIntersectionCollider} from "./EventIntersectionCollider.js";
import type {TUserId} from "@sh3pherd/shared-types";

type contextType = {
    context?: {
        eventIntersection?: {
            target_id?: TUserId;
            intersectsWith?: TUserId[];
        }
    }
}

export class CollisionEngine {
    constructor() {
        const eventIntersection = new EventIntersectionCollider()

        const collidersArray = [eventIntersection];
        collidersArray.forEach((collider) => {
            collider.addEvent(eventUnits)
            collider.setContext(context?.eventIntersection || {});
        });
    }
}