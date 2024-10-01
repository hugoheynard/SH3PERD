import {IndividualPlanning} from "./class_IndividualPlanning.js";
import {findEarliestEventInArray, findLatestEventInArray} from "../../../../backend/Utilities/sortBlockArray.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {CalendarHeader} from "./class_CalendarHeader.js";
import {CalHoursGrid} from "./class_calHoursGrid.js";
import {DateMethod} from "../../../../backend/Utilities/class_DateMethods.js";
import {ColorScheme} from "../../../../db/fakeDB-design.js";
import {EventDecorator_RecallFormOnClick} from "./eventDecorators/class_EventDecorator_RecallFormOnClick.js";
import {EventDecorator_ColorizeEvent} from "./eventDecorators/class_EventDecorator_ColorizeEvent.js";


export class Calendar {
    constructor(calendarData) {
        this.calendarData = calendarData;
        this.planningList = [];

        this.earliestEvent = findEarliestEventInArray(Object.values(this.calendarData.events));
        this.latestEvent = findLatestEventInArray(Object.values(this.calendarData.events));

        this.offset = this.getOffset();
        this.rowZoom = 15;

        this.colorScheme = new ColorScheme().getColorData();
        this.htmlElement = new HTMLelem('div', "calendars").render();

        this.buildCalendar();
    };
    buildCalendar(){
        this.resetInstanceAndContainer();
        this.getOffset();
        this.defineGridRowsNumber(Object.values(this.calendarData.events));
        this.buildGridOverlay(Object.values(this.calendarData.events));
        this.buildIndividualPlannings(this.calendarData.plannings);

        new EventDecorator_ColorizeEvent({eventsBlock: this.getAllEventsBlocks(this.planningList)});
        new EventDecorator_RecallFormOnClick({eventsBlock: this.getAllEventsBlocks(this.planningList)});
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
                id: `planning_${elem.staff_id}`,
                calendar_events: elem.calendar_events.map(event_id => this.calendarData.events[event_id]),
                collisionList: elem.collisionList,
                negativeOffset: this.offset,
                numberOfRows: this.gridRowsNumber,
                rowSize: this.rowZoom
            });
            this.planningList.push(planning);
            this.htmlElement.appendChild(planning.renderPlanning());
        }
        /*
               this.header = new CalendarHeader(
                   {
                       subList: subList,
                       colorScheme: this.colorScheme
                }).render()
                            }
                */
    };

    buildGridOverlay() { //TODO: extract as a Calendar Decorator
        const hourGrid = new CalHoursGrid({
            offset: this.offset,
            earliestTimeStep: this.earliestEvent.date,
            latestTimeStep: DateMethod.addMinutes(this.latestEvent.date, this.latestEvent.duration)
        });

        this.htmlElement.appendChild(hourGrid.calHoursLines);
        this.htmlElement.appendChild(hourGrid.calHoursText);

        hourGrid.calHoursLines.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, ${this.rowZoom}px)`;
        hourGrid.calHoursText.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, ${this.rowZoom}px)`;
    };

    defineGridRowsNumber(eventArray) {
        const firstEventDate = findEarliestEventInArray(eventArray).date;
        const lastEvent = findLatestEventInArray(eventArray);
        const lastTime = DateMethod.addMinutes(lastEvent.date, lastEvent.duration);

        this.gridRowsNumber = DateMethod.differenceInMinutes(firstEventDate, lastTime) / DateMethod.STEP_DURATION;
    };

    resetInstanceAndContainer() {
        this.htmlElement.innerHTML = '';
    };

    getOffset() {
        const firstBlock = this.earliestEvent;
        const dayStart = DateMethod.startOfDay(new Date(firstBlock.date));

        return (firstBlock.date - dayStart) / (DateMethod.ONE_MINUTE_IN_MS * DateMethod.STEP_DURATION) - 1;
    };
}