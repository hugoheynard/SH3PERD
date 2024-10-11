

export class PlanningDecorator_CrossPlanningDisplayTransform{
    constructor(input) {
        this.crossPlanningDisplayActive = true;

        this.calendar = input.calendar;
        this.plannings = this.calendar.calendarData.plannings;
        this.referencePlanning = this.plannings[0];

        this.displayCrossPlannings(this.referencePlanning);
    };

    displayCrossPlannings(triggerPlanning) {
        this.findPlanningsToTransform(this.referencePlanning);
        const { planningList } = this.calendar;

        for (const planning of planningList) {

            if (this.isReferencePlanning(planning)) {
                this.referencePlanningProcess(planning);
                continue;
            }

            if (this.isNotACrossEventPlanning(planning)) {
                this.noCrossPlanningProcess(planning);
            }

            this.crossPlanningProcess(planning);
        }
    };

    findPlanningsToTransform(triggerPlanning) {
        console.log(triggerPlanning.collisions.external) //TODO: remove log
        this.crossEventsPlanningMap = new Map();
        this.noCrossEventsPlanningMap = new Map();

        for (const planning of this.plannings) {

            if (!triggerPlanning.collisions.external[planning.staff_id]) {
                this.noCrossEventsPlanningMap.set(planning.staff_id, planning);
            }

            this.crossEventsPlanningMap.set(planning.staff_id, planning);
        }
    };

    isReferencePlanning(planning) {
        return planning.id === this.referencePlanning.staff_id;
    };

    isNotACrossEventPlanning(planning) {
        return this.noCrossEventsPlanningMap.get(planning.id)
    };

    noCrossPlanningProcess(planning) {
        planning.hidePlanning();
        this.changePlanningStyle({
            target: planning,
            fromCssClass: 'crossPlanningCalendar',
            toCssClass: 'dailyPlanningCalendar'
        });
    };

    referencePlanningProcess(planning) {
        planning.showPlanning();
        this.changePlanningStyle({
            target: planning,
            fromCssClass: 'crossPlanningCalendar',
            toCssClass: 'dailyPlanningCalendar'
        });
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
            eventGridBlock.html.style.border = '2px solid blue';
            eventGridBlock.html.style.width = `${planning.rowSize}px`;
        }
    };
}