import {ViewContext} from "./planningClasses/class_ViewContext.js";
import {BackEndCall} from "../../frontElements/Classes/class_BackEndCalls.js";


const calendarViewContext = await new ViewContext(await BackEndCall.getDay('2024-12-19'));
const wsPage_Calendar = async () => calendarViewContext.render();

export {wsPage_Calendar, calendarViewContext};