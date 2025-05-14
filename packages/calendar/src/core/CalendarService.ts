import { type TCalendarBuilderInput, type TCalendarBuilderOutput} from "./builders/buildCalendar.js";
import {EventIntersectionCollider} from "./colliders/EventIntersectionCollider.js";


export type TCalendarServiceDeps = {}

class CalendarService {
    private readonly deps: any;
    
    constructor(deps: any) {
        this.deps = deps;
    }

    build(input: any): any {
        /*
        const colliders = Object.entries(input.context || {}).map(([name, ctx]) => ({
            name,
            collider: this.colliderMap[name as keyof typeof this.colliderMap],
            context: ctx
        }));
*/

    }
}