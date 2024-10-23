import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {MiniCalendar} from "../../frontElements/Classes/class_MiniCalendar.js";
import {PlanningFilters} from "./planningClasses/PlanningFilters.js";
import {Calendar} from "./planningClasses/Calendar.js";
import {CalendarDecorator_singleSelector} from "./viewDecorators/class_CalendarDecorator_singleSelector.js";
import {PlanningDecorator_CrossPlanningDisplayTransform} from "./class_PlanningDecorator_CrossPlanningDisplayTransform.js";


export class CalendarPage {
    constructor(input) {
        this.calendarData = input.data;
        this.view = 'single';

        this.html = new HTMLelem('div', 'wsPage_Calendars').render();
        this.initHtmlStructure();
    };
    initHtmlStructure() {
        this.calContainer = new HTMLelem('div', 'calContainer').render();
        this.leftSideContainer = new HTMLelem('div', 'leftSideElements', 'popMenu').render();
        this.html.appendChild(this.leftSideContainer);
        this.html.appendChild(this.calContainer);
    };

    buildView() {
        this.undisplayCalendar();
        this.calendar = new Calendar(this.calendarData);
        this.currentSelector = new CalendarDecorator_singleSelector({ calendar: this.calendar });
        new PlanningDecorator_CrossPlanningDisplayTransform({ calendar: this.calendar });

        //this.calContainer.appendChild(this.calendar.header); //TODO: HEADER CAT SUBCAT
        this.calContainer.appendChild(this.calendar.html);
        this.addMiniCalendar();
        this.addFilters();
    };

    buildCalendar(input) {
        const { calendar } = input;

        this.calContainer.appendChild(calendar.html);
    };


    //todo séparer dans une autre classe

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
}