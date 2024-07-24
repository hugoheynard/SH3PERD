import {testDay} from "./BackEnd/Classes/class_Day.js";
import {MiniCalendar} from "./Front/Classes/class_MiniCalendar.js";
import {artistMockupDB} from "./db/fakeDB.js";
import {IndividualPlanning} from "./Front/workspaces/ws_calendar/planningClasses/class_IndividualPlanning.js";
import {getColorScheme} from "./db/fakeDB-design.js";
import {generateCssColors} from "./Front/Utilities/DesignJS/ColorGenerator/createPlanningStylesheet.js";
import {findOccurrencesInArray} from "./Front/Utilities/findOccurencesInArray.js";
import {CalendarIndiv} from "./Front/workspaces/ws_calendar/planningClasses/class_CalendarIndiv.js";
import {ViewContext} from "./Front/workspaces/ws_calendar/planningClasses/class_ViewContext.js";

//Loading DOM et stylesheets :
const colorStylesheet = document.styleSheets[1];

//OK
//new MiniCalendar("", "monthlyCal");




// Context
//const viewContext = new ViewContext(testDay[0].timeTable, artistMockupDB);


//https://www.w3schools.com/howto/howto_js_media_queries.asp to manage media queries, having only cats on phone

