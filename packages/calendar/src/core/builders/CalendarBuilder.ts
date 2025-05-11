import type {TEventUnitDomainModel, TEventUnitId, TUserId} from "@sh3pherd/shared-types";
import {EventIntersectionCollider} from "../colliders/EventIntersectionCollider.js";

/**
 * CalendarBuilder is a class that builds a calendar for users based on the provided event units.
 * It creates a mapping of users to the events they participate in and can also handle collision detection
 * between events if specified in the options.
 */
export type TCalendarBuilderInput = {
    eventUnits: TEventUnitDomainModel[];
    user_ids: TUserId[];
    options?: {
        intersects: boolean;
        target_id?: TUserId;
        intersectsWith?: TUserId[];
    };
}

export class CalendarBuilder {
    private readonly eventUnitsMap: Map<TEventUnitId, TEventUnitDomainModel>;
    private readonly calendarMap: Map<TUserId, { user_id: TUserId, participatesIn: TEventUnitId[] }>;
    private readonly input: TCalendarBuilderInput;
    private userSet: Set<TUserId>;
    private eventIntersectionCollider?: EventIntersectionCollider;

    constructor(input: TCalendarBuilderInput) {
        this.input = input;
        this.eventUnitsMap = new Map();
        this.calendarMap = new Map();
        this.userSet = new Set(input.user_ids);
        this.initializeCollider();
    };

    private initializeCollider(): void {
        const { options } = this.input;

        if (options?.intersects && options.target_id) {
            this.eventIntersectionCollider = new EventIntersectionCollider();
        }
    };

    public build(): {
        calendars: Map<TUserId, { user_id: TUserId, participatesIn: TEventUnitId[] }>;
        eventUnits: Map<TEventUnitId, TEventUnitDomainModel>;
        collisionEventUnits?: Map<TEventUnitId, TEventUnitDomainModel>;
    } {
        const { eventUnits, user_ids , options} = this.input;

        //base build logic
        for (const event of eventUnits) {
            if (!event.eventUnit_id) {
                console.warn(`Skipped event with missing eventUnit_id: ${JSON.stringify(event)}`);
                continue;
            }

            this.eventUnitsMap.set(event.eventUnit_id, event);

            for (const participant of event.participants || []) {
                //avoids creating planning for members in event but not in query
                if (!participant || !this.userSet.has(participant)) {
                    continue;
                }

                //avoid creating duplicates, initialize if not present
                if (!this.calendarMap.has(participant)) {
                    this.calendarMap.set(participant, {user_id: participant, participatesIn: []});
                }

                //pushes eventUnit_id to the calendar
                this.calendarMap.get(participant)!.participatesIn.push(event.eventUnit_id);

                //Addition for collision :
                if (!options?.intersects) {
                    continue;
                }

                //only add collisions if target_id is present or intersectsWith is related to the event
                if (this.eventIntersectionCollider && this.shouldIncludeForCollision(event)) {
                    this.eventIntersectionCollider.addEvent(event);
                }
            }
        }

        if ((options?.intersects && this.eventIntersectionCollider)) {
            const collisionEventUnits = this.eventIntersectionCollider
                .execute()
                .reduce((acc, event) => {
                    if (event.eventUnit_id) {
                        acc.set(event.eventUnit_id, event);
                    }
                    return acc;
                }, new Map<TEventUnitId, TEventUnitDomainModel>())

            return {
                calendars: this.calendarMap,
                eventUnits: this.eventUnitsMap,
                collisionEventUnits
            };
        }

        return {
            calendars: this.calendarMap,
            eventUnits: this.eventUnitsMap,
        };
    };


    //UTILS METHODS
    private shouldIncludeForCollision(event: TEventUnitDomainModel): boolean {
        const { options } = this.input;
        if (!options?.intersects) {
            return false;
        }

        const { target_id, intersectsWith } = options;

        return (
            // we share an event so full intersection
            (target_id && event.participants.includes(target_id)) ||
            (Array.isArray(intersectsWith) && intersectsWith.some((user: TUserId) => event.participants.includes(user)))
        );
    };
}
