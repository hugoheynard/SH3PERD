import {ViewContext} from "./planningClasses/class_ViewContext.js";
import {BackEndCall} from "../../frontElements/Classes/class_BackEndCalls.js";
import {DateMethod} from "../../../backend/Utilities/class_DateMethods.js";

const test = await BackEndCall.getDay('2024-12-19')


const calendarViewContext = await new ViewContext(test);
const wsPage_Calendar = async () => calendarViewContext.render();

export {wsPage_Calendar, calendarViewContext};