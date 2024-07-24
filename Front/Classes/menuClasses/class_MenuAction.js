import {WorkSpaceContext} from "../../workspaces/class_workspaceContext.js";
import {WS_Calendar} from "../../workspaces/ws_calendar/class_ws_Calendar.js";
import {WS_MusicLibrary} from "../../workspaces/ws_musicLibrary/class_ws_MusicLibrary.js";
import {BackEndCall} from "../class_BackEndCalls.js";

class MenuAction {

    //For appGeneral menu
    static goHome() {
        console.log("goHome");
    }

    static goCalendar() {
        console.log("goCalendar");
        new WorkSpaceContext().setWorkspace(new WS_Calendar())
    }

    static goMusicLibrary() {
        console.log("goMusicLibrary");
        new WorkSpaceContext().setWorkspace(new WS_MusicLibrary());
    }

    static goPlaylistManager() {
        console.log("goPlaylistManager");
    }

    static goCabaretManager() {
        console.log("goCabaretManager");
    }

    static logOut() {
        console.log("logOut");
    }

    //For workspace - musicLib
    static addTrack() {

    };





}

export {MenuAction};