import {calendarViewContext, wsPage_Calendar} from "../wsPage_Calendar.js";
import {appWorkspace, ws_Calendar} from "../../../script.js";
import {wsPopWindow_AddEvent} from "../wsCal_PopWindows/wsPopWindow_AddEventWindow.js";
import {wsPopMenu_CalendarHome} from "../PopMenus_Calendar/wsPopMenu_CalendarHome.js";

export class CalendarMenuAction {
    //CALENDAR NAVIGATION
    static goCalendar = ()=> appWorkspace.setWorkspace(ws_Calendar);
    static calViewIndiv = () => {
        calendarViewContext.viewIndiv();
        appWorkspace.workSpaceStrategy.pageContext.setPage(wsPage_Calendar());
    }
    static calViewCat = () => {
        calendarViewContext.viewPerCat();
        appWorkspace.workSpaceStrategy.pageContext.setPage(wsPage_Calendar());
    }
    static calViewAll = () => {
        calendarViewContext.viewAll();
        appWorkspace.workSpaceStrategy.pageContext.setPage(wsPage_Calendar());
    }

    static calAddEventWindow = async () => {
        await appWorkspace.workSpaceStrategy.rightPanelContext.setRightPanel(await wsPopWindow_AddEvent());
    };

    static calAddTimeframeWindow = async () => {
        await appWorkspace.workSpaceStrategy.rightPanelContext.setRightPanel(await wsPopMenu_CalendarHome());
    };

    static goPop_CalendarHome = () => appWorkspace.workSpaceStrategy.rightPanelContext.setRightPanel(wsPopMenu_CalendarHome());
}