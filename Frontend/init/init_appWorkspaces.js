import {wsMenu_Calendar} from "../workspaces/ws_calendar/wsMenu_Calendar.js";
import {wsMenu_staffMember} from "../workspaces/ws_staffMember/wsMenu_staffMember.js";
import {wsPage_Home} from "../workspaces/ws_Home/wsPage_Home.js";
import {wsPage_musicLibrary} from "../workspaces/ws_musicLibrary/wsPage_musicLibrary.js";
import {wsPage_playlistManager} from "../workspaces/ws_PlaylistManager/wsPage_playlistManager.js";
import {wsPage_planningCabaret} from "../workspaces/ws_cabManager/wsPage_planningCabaret.js";
import {wsPage_workPeriods} from "../workspaces/ws_staffMember/staffMemberPages/wsPage_workPeriods.js";
import {WorkspaceStrategy} from "../workspaces/navigationArchitecture/WorkspaceStrategy.js";
import {CalendarPage} from "../workspaces/ws_calendar/class_CalendarModule.js";
import {Calendar} from "../workspaces/ws_calendar/planningClasses/Calendar.js";
import {Calendar_BackendCall} from "../backendCalls/Calendar_BackendCall.js";


// WORKSPACES INITIALISATION
export const ws_Home = new WorkspaceStrategy({ defaultPage: wsPage_Home() });





export const ws_Calendar = new WorkspaceStrategy({ wsMenu: wsMenu_Calendar });

export const calendarPage = new CalendarPage({})
const calendarData  = await new Calendar_BackendCall().getDay('2024-12-19')

export const userCalendar = new Calendar({ data: calendarData });
ws_Calendar.pageContext.setPage(calendarPage.html);
calendarPage.buildCalendar({ calendar: userCalendar });








export const ws_musicLibrary = new WorkspaceStrategy({ defaultPage: wsPage_musicLibrary() });

export const ws_Playlists = new WorkspaceStrategy({ defaultPage: wsPage_playlistManager() });

export const ws_Cabaret = new WorkspaceStrategy({ defaultPage: wsPage_planningCabaret() });

export const ws_staffMember = new WorkspaceStrategy(
    {
        wsMenu: wsMenu_staffMember,
        defaultPage: wsPage_workPeriods()
    });
