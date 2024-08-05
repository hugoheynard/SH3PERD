import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {artistMockupDB} from "../../../db/fakeDB.js";
import {testDay} from "../../../BackEnd/Classes/class_Day.js";
import {ViewContext} from "./planningClasses/class_ViewContext.js";
import {MiniCalendar} from "../../frontElements/Classes/class_MiniCalendar.js";


const wsPage_Calendar = async () => {

    const page = new HTMLelem('div', 'wsPage_Calendars').render()
    const leftSideElements = new HTMLelem('div', 'leftSideElements', 'popMenu').render()
    leftSideElements.appendChild(new MiniCalendar('miniCal').render())

    const viewContext = await new ViewContext(testDay[0].timeTable, artistMockupDB).render();

    page.appendChild(leftSideElements)
    page.appendChild(viewContext)

    console.log(page)

    return page;
}

export {wsPage_Calendar};