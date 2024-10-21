export class CalendarService {
    constructor(input) {
        this.builder = input.builder;
        this.eventGenerator = input.eventGenerator;
        this.planningCollisionManager = input.planningCollisionManager;
        this.staffInteractionTool = input.staffInteractionTool;
    };
}