import {IndividualPlanning} from "./class_IndividualPlanning.js";
import {sortEventsArrayPerTime} from "../../../../backend/Utilities/sortBlockArray.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {CalendarHeader} from "./class_CalendarHeader.js";
import {CalHoursGrid} from "./class_calHoursGrid.js";
import {DateMethod} from "../../../../backend/Utilities/class_DateMethods.js";
import {ColorScheme} from "../../../../db/fakeDB-design.js";

export class Calendar {
    constructor(calendarData) {
        this.calendarData = calendarData;
        this.planningList = [];

        this.offset = this.getOffset();
        this.rowZoom = 18;
        this.fontZoom = 12;

        this.colorScheme = new ColorScheme().getColorData();
        this.htmlElement = new HTMLelem('div', "calendars").render();

        this.buildCalendar();
    };
    buildCalendar(){
        this.resetInstanceAndContainer();
        this.getOffset();
        this.addIndividualPlannings();
        //this.buildGridOverlay();
        this.updateContainer();
    };
    defineGridRowsNumber(blockList) {
        /*Difference between the end of the last block and midnight */
        const firstWorkBlock = {...blockList[0]};
        const lastWorkBlock = {...blockList.at(-1)};
        const lastTime = DateMethod.addMinutes(lastWorkBlock.date, lastWorkBlock.duration).getTime();
        const firstTime = firstWorkBlock.date;

        this.gridRowsNumber = DateMethod.differenceInMinutes(firstTime, lastTime) / DateMethod.STEP_DURATION
    };
    resetInstanceAndContainer() {
        this.htmlElement.innerHTML = '';
    };
    buildGridOverlay() {
        //TODO Grid overlay - si on tombe sur une heure pleine, faire en sorte que la barre de l'overlay remplace et le chiffre se mettent en rouge et faire disparaitre l'overlay now
        const hourGrid = new CalHoursGrid(this.timeTable, this.offset);

        this.htmlElement.appendChild(hourGrid.calHoursLines);
        this.htmlElement.appendChild(hourGrid.calHoursText);

        hourGrid.calHoursLines.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, 1rem)`;
        hourGrid.calHoursText.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, 1rem)`;
    };
    addIndividualPlannings() {
        //build planning for each artist
        for (const elem of this.calendarData.plannings) {

            const planning = new IndividualPlanning({
                id: `planning_${elem.staff_id}`,
                calendar_events: elem.calendar_events
                    .map(event_id => this.calendarData.events[event_id]),
                negativeOffset: this.offset,
                numberOfRows: this.gridRowsNumber,
                //backgroundOverlay: this.colorScheme.artist({artistID: artist._id})
            });
            this.planningList.push(planning);
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

    updateContainer(){
        for (const planning of this.planningList) {
            planning.planning.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, 1rem)`;
            this.htmlElement.appendChild(planning.renderPlanning())
        }
    };


    getOffset() {
        const eventsArray = Object.values(this.calendarData.events);
        const firstBlock = sortEventsArrayPerTime(eventsArray)[0];
        const dayStart = DateMethod.startOfDay(new Date(firstBlock.date));

        return (firstBlock.date - dayStart) / (DateMethod.ONE_MINUTE_IN_MS * DateMethod.STEP_DURATION) - 1;
    };
}