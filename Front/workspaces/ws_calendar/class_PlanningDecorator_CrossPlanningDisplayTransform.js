export class PlanningDecorator_CrossPlanningDisplayTransform{
    constructor(input) {
        this.crossPlanningDisplayActive = true;

        this.calendar = input.calendar;
        this.plannings = this.calendar.calendarData.plannings;
        this.referencePlanning = this.plannings[0];

        this.displayCrossPlannings();
    };

    displayCrossPlannings() {
        const { planningList } = this.calendar;
        const { external } = this.referencePlanning.collisions;

        for (const planning of planningList) {

            if (!external.hasOwnProperty(planning.id)) {
                continue;
            }

            this.crossPlanningProcess(planning);
        }
    };

    crossPlanningProcess(planning) {
        this.changePlanningStyle({
            target: planning,
            fromCssClass: 'dailyPlanningCalendar',
            toCssClass: 'crossPlanningCalendar'
        });
        this.changePlanningGridSpecs(planning);

        const crossEventsSource = this.referencePlanning.collisions.external[planning.id].crossEvent.map(ev => {
            return {
                _id: ev.comparedToEvent,
                ...ev.collisionEvent
            }
        });
        /*TODO: le fait que les blocks prennent le bon nombre de case en largeur sur les cross plannings*/
        planning.buildEventGridBlocks({eventSource: crossEventsSource});
        planning.appendAllEventsToPlanning(planning.gridBlockArray);
        this.changeEventBlockDesign(planning)

        planning.showPlanning();
    };

    //Planning design methods
    changePlanningGridSpecs(planning) {
        planning.html.style.gridTemplateColumns = `repeat(${planning.numberOfCol}, ${planning.rowSize}px)`;
    };

    changePlanningStyle(input) {
        input.target.html.classList.remove(input.fromCssClass);
        input.target.html.classList.add(input.toCssClass);
    };

    //block design methods
    changeEventBlockDesign(planning) {
        for (const eventGridBlock of planning.gridBlockArray) {
            eventGridBlock.html.style.backgroundColor = 'red';
            eventGridBlock.html.style.border = '1px solid blue';
            eventGridBlock.html.style.width = `${planning.rowSize}px`;
        }
    };
}