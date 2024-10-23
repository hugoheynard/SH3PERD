import {
    ws_Cabaret,
    ws_Home,
    ws_musicLibrary,
    ws_Playlists, ws_staffMember,
} from "../../../init/init_appWorkspaces.js";

import {wsPage_workPeriods} from "../../../workspaces/ws_staffMember/staffMemberPages/wsPage_workPeriods.js";
import {createArtistProfile} from "../../Forms/appForms/artistProfileForms/createArtistProfile.js";
import {wsPopMenu_CalendarHome} from "../../../workspaces/ws_calendar/wsCal_RightPanelWindows/wsPopMenu_CalendarHome.js";

import {wsPopWindow_AddEvent} from "../../../workspaces/ws_calendar/wsCal_RightPanelWindows/wsPopWindow_AddEventWindow.js";
//import {appWorkspace} from "../../../script.js";



class MenuAction {
    constructor(input) {
        this.appWorkspace = input.appWorkspace;
    }

    //For appGeneral menu
    //goHome = () => appWorkspace.setWorkspace(ws_Home);
    //goCalendar = () => appWorkspace.setWorkspace(appModuleManager['calendar']);
    //goMusicLibrary = () => appWorkspace.setWorkspace(ws_musicLibrary);
    //goPlaylistManager = () => appWorkspace.setWorkspace(ws_Playlists);
    //goCabaretManager = () => appWorkspace.setWorkspace(ws_Cabaret);

    //STAFFMEMBER NAVIGATION
    //goStaffMember = () => appWorkspace.setWorkspace(ws_staffMember);
    //static goWorkPeriodsPage = () => appWorkspace.workSpaceStrategy.pageContext.setPage(wsPage_workPeriods());
    //static goStaffMemberInfosPage = () => appWorkspace.workSpaceStrategy.pageContext.setPage(createArtistProfile());

    static logOut = () => console.log("logOut");


    //For workspace - musicLib
    static addTrack() {

    };

}

export {MenuAction};