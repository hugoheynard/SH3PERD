import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {MiniCalendar} from "../../frontElements/Classes/class_MiniCalendar.js";
import {PlanningFilters} from "./Filters/class_PlanningFilters.js";
import {Calendar} from "./planningClasses/class_Calendar.js";
import {CalendarDecorator_singleSelector} from "./viewDecorators/class_CalendarDecorator_singleSelector.js";


export class CalendarModule {
    constructor(input) {
        this.calendarData = input.data;
        this.view = 'single';


        this.wsPageContainer = new HTMLelem('div', 'wsPage_Calendars').render();
        this.calContainer = new HTMLelem('div', 'calContainer').render();
        this.leftSideContainer = new HTMLelem('div', 'leftSideElements', 'popMenu').render();
        this.wsPageContainer.appendChild(this.leftSideContainer);
        this.wsPageContainer.appendChild(this.calContainer);
    };

    buildView() {
        this.undisplayCalendar();
        this.calendar = new Calendar(this.calendarData);
        this.currentSelector = new CalendarDecorator_singleSelector(this.calendar);
        //this.calContainer.appendChild(this.calendar.header); //TODO: ba voila enlever
        this.calContainer.appendChild(this.calendar.html);
        this.addMiniCalendar();
        this.addFilters();
    };

    addMiniCalendar() {
        this.leftSideContainer.appendChild(new MiniCalendar('miniCal').render());
    };
    addFilters() {
        this.leftSideContainer.appendChild(new PlanningFilters(this.calendar).render());
    };
    undisplayCalendar() {
        this.leftSideContainer.innerHTML = '';
        this.calContainer.innerHTML = '';
    };
    render() {
        this.buildView();
        return this.wsPageContainer;
    };
}