import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {CalHoursGrid} from "./CalHoursGrid.js";
import {EventDecorator_RecallFormOnClick} from "./eventDecorators/class_EventDecorator_RecallFormOnClick.js";
import {EventDecorator_ColorizeEvent} from "./eventDecorators/class_EventDecorator_ColorizeEvent.js";
import {GridBlock} from "./GridBlock.js";


export class Calendar {
    constructor(input) {
        this.calendarData = input.data;
        this.rowZoom = 15;
        this.specs = this.calendarData.specs;
        this.gridRowsNumber = this.calendarData.specs.layout.gridRowsNumber;
        this.offset = this.calendarData.specs.layout.offsetFromDayStart;

        this.html = new HTMLelem('div', "calendars").render();

        this.buildCalendar();
    };
    buildCalendar(){
        try{
            this.resetInstanceAndContainer();
            this.buildGridOverlay(this.specs);
            this.buildPlanningGrid(this.calendarData);
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

    buildPlanningGrid(data) {
        const planning = new HTMLelem('div', 'planningGrid').render();
        //set grid specs
        planning.style.gridTemplateColumns = `repeat(${this.specs.layout.gridTotalColNumber}, 1fr)`;
        planning.style.gridTemplateRows = `repeat(${this.specs.layout.gridRowsNumber}, ${this.rowZoom}px)`;

        this.html.appendChild(planning);

        for (const planningElement of data.plannings) {

            planningElement.calendar_events
                .map(event_id => this.calendarData.events[event_id])
                .map(event => planning.appendChild(
                    new GridBlock({
                        id: event._id,
                        gridCoordinates: planningElement.eventGridPositions[event._id],
                        blockData: event
                    }).html
                ))
        }
    };

    buildGridOverlay(specs) { //TODO: extract as a Calendar Decorator
        const { earliestTimeStamp, latestTimeStamp } = specs.timestamps;

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

    resetInstanceAndContainer() {
        this.html.innerHTML = '';
        this.planningList = [];
    };
}