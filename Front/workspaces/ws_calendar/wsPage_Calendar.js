import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {artistMockupDB} from "../../../db/fakeDB.js";
import {testDay} from "../../../BackEnd/Classes/class_Day.js";
import {ViewContext} from "./planningClasses/class_ViewContext.js";
import {MiniCalendar} from "../../frontElements/Classes/class_MiniCalendar.js";

const calendarViewContext = await new ViewContext(testDay[0].timeTable, artistMockupDB)

const wsPage_Calendar = async () => {

    const page = new HTMLelem('div', 'wsPage_Calendars').render()
    const leftSideElements = new HTMLelem('div', 'leftSideElements', 'popMenu').render()
    leftSideElements.appendChild(new MiniCalendar('miniCal').render())



    page.appendChild(leftSideElements)
    page.appendChild(calendarViewContext.render())


    return page;
}

export {wsPage_Calendar, calendarViewContext};