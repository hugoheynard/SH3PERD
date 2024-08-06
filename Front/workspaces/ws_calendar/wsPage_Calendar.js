import {artistMockupDB} from "../../../db/fakeDB.js";
import {testDay} from "../../../BackEnd/Classes/class_Day.js";
import {ViewContext} from "./planningClasses/class_ViewContext.js";


const calendarViewContext = await new ViewContext(testDay[0].timeTable, artistMockupDB);
const wsPage_Calendar = async () => calendarViewContext.render();

export {wsPage_Calendar, calendarViewContext};