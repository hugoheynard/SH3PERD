import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {ViewContext} from "./planningClasses/class_ViewContext.js";
import {testDay} from "../../../BackEnd/Classes/class_Day.js";
import {artistMockupDB} from "../../../db/fakeDB.js";

const wsPage_Calendar = async () => {

    const page = new HTMLelem('div', 'appElements').render()

    page.appendChild(new HTMLelem('div', "calHeaderMatrix").render())
    page.appendChild(new HTMLelem('div', "calendars").render())
    const viewContext = new ViewContext(testDay[0].timeTable, artistMockupDB);

    return page;
}

export {wsPage_Calendar};