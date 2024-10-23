import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {IndividualPlanning} from "./IndividualPlanning.js";
import {CalHoursGrid} from "./CalHoursGrid.js";
import {DateMethod} from "../../../../backend/Utilities/class_DateMethods.js";
import {EventDecorator_RecallFormOnClick} from "./eventDecorators/class_EventDecorator_RecallFormOnClick.js";
import {EventDecorator_ColorizeEvent} from "./eventDecorators/class_EventDecorator_ColorizeEvent.js";


export class Calendar {
    constructor(input) {
        this.calendarData = input.data;
        this.rowZoom = 15;
        this.specs = this.calendarData.specs;

        this.html = new HTMLelem('div', "calendars").render();

        this.buildCalendar();
    };
    buildCalendar(){
        try{
            this.resetInstanceAndContainer();
            this.getRowOffset(this.specs);
            this.defineGridRowsNumber(this.specs);
            this.buildGridOverlay(this.specs);
            this.buildIndividualPlannings(this.calendarData.plannings);

            new EventDecorator_ColorizeEvent({ eventsBlock: this.getAllEventsBlocks(this.planningList) });
            new EventDecorator_RecallFormOnClick({ eventsBlock: this.getAllEventsBlocks(this.planningList) });
        } catch (e) {
            console.error(e)
        }
        //TODO: new PlanningDecorator_addBackGroundOverlay(planningList)
    };

    getAllEventsBlocks(planningList) {
        return planningList
            .map(planning => planning.gridBlockArray)
            .reduce((acc, curr) => [...acc, ...curr], []);
    };

    buildIndividualPlannings(plannings) {
        //build planning for each artist
        for (const elem of plannings) {

            const planning = new IndividualPlanning({
                id: elem.staff_id,
                firstName: elem.firstName,
                calendar_events: elem.calendar_events.map(event_id => this.calendarData.events[event_id]),
                collisionList: elem.collisions.internal.crossEvent,
                negativeOffset: this.offset,
                numberOfRows: this.gridRowsNumber,
                maxInternalCollisions: elem.collisions.internal.maxCollisions,
                rowSize: this.rowZoom
            });
            this.planningList.push(planning);
            this.html.appendChild(planning.html);
        }
    };

    buildGridOverlay(specs) { //TODO: extract as a Calendar Decorator
        const { earliestTimeStamp, latestTimeStamp } = specs;

        const hourGrid = new CalHoursGrid({
            offset: this.offset,
            earliestTimeStep: earliestTimeStamp,
            latestTimeStep: latestTimeStamp
        });

        this.html.appendChild(hourGrid.calHoursLines);
        this.html.appendChild(hourGrid.calHoursText);

        hourGrid.calHoursLines.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, ${this.rowZoom}px)`;
        hourGrid.calHoursText.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, ${this.rowZoom}px)`;
    };

    defineGridRowsNumber(specs) {
        const { earliestTimeStamp, latestTimeStamp } = specs;
        this.gridRowsNumber = DateMethod.differenceInMinutes(earliestTimeStamp, latestTimeStamp) / DateMethod.STEP_DURATION;
    };

    getRowOffset(specs) {
        const { earliestTimeStamp, dayStartTimestamp } = specs;
        this.offset = (earliestTimeStamp - dayStartTimestamp) / (DateMethod.ONE_MINUTE_IN_MS * DateMethod.STEP_DURATION) - 1;
    };

    resetInstanceAndContainer() {
        this.html.innerHTML = '';
        this.planningList = [];
    };
}