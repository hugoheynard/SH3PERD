export class CalendarDecorator_singleSelector {
    constructor(calendar) {
        this.calendar = calendar;
        this.index = 0;
        this.currentDisplay = this.calendar.planningList[this.index];

        this.displaySelection();
        this.undisplayNonSelectedPlannings()
    };
    displaySelection() {
        this.currentDisplay.planning.style.display = 'grid';
    };
    undisplayNonSelectedPlannings() {
        this.calendar.planningList.filter(planning => planning !== this.currentDisplay)
            .map(planning => planning.planning.style.display = 'none');
    };
}