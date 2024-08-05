import {
    appWorkspace,
    ws_Home,
    ws_Calendar,
    ws_musicLibrary,
    ws_Playlists,
    ws_Cabaret,
    ws_staffMember
} from "../../../script.js";

import {wsPage_workPeriods} from "../../../workspaces/ws_staffMember/staffMemberPages/wsPage_workPeriods.js";
import {createArtistProfile} from "../../Forms/appForms/artistProfileForms/createArtistProfile.js";
import {wsPopMenu_CalendarHome} from "../../../workspaces/ws_calendar/PopMenus_Calendar/wsPopMenu_CalendarHome.js";
import {calendarViewContext, wsPage_Calendar} from "../../../workspaces/ws_calendar/wsPage_Calendar.js";

class MenuAction {

    //For appGeneral menu
    static goHome = () => appWorkspace.setWorkspace(ws_Home);

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
    static goPop_CalendarHome = () => appWorkspace.workSpaceStrategy.popContext.setPopMenu(wsPopMenu_CalendarHome());







    static goMusicLibrary = () => appWorkspace.setWorkspace(ws_musicLibrary);
    static goPlaylistManager = () => appWorkspace.setWorkspace(ws_Playlists);
    static goCabaretManager = () => appWorkspace.setWorkspace(ws_Cabaret);

    //STAFFMEMBER NAVIGATION
    static goStaffMember = () => appWorkspace.setWorkspace(ws_staffMember);
    static goWorkPeriodsPage = () => appWorkspace.workSpaceStrategy.pageContext.setPage(wsPage_workPeriods());
    static goStaffMemberInfosPage = () => appWorkspace.workSpaceStrategy.pageContext.setPage(createArtistProfile());

    static logOut = () => console.log("logOut");


    //For workspace - musicLib
    static addTrack() {

    };

}

export {MenuAction};