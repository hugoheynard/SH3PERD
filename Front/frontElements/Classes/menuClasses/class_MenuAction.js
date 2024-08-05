import {
    appWorkspace,
    ws_Calendar, ws_Home,
    ws_musicLibrary,
    ws_staffMember
} from "../../../script.js";

import {wsPage_workPeriods} from "../../../workspaces/ws_staffMember/staffMemberPages/wsPage_workPeriods.js";
import {createArtistProfile} from "../../Forms/appForms/artistProfileForms/createArtistProfile.js";

class MenuAction {

    //For appGeneral menu
    static goHome = () => appWorkspace.setWorkspace(ws_Home);
    static goCalendar = ()=> appWorkspace.setWorkspace(ws_Calendar);
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