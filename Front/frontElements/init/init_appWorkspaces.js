import {wsMenu_Calendar} from "../../workspaces/ws_calendar/wsMenu_Calendar.js";
import {wsMenu_staffMember} from "../../workspaces/ws_staffMember/wsMenu_staffMember.js";
import {appModuleManager} from "./init_appModules.js";
import {wsPage_Home} from "../../workspaces/ws_Home/wsPage_Home.js";
import {wsPopWindow_AddEvent} from "../../workspaces/ws_calendar/wsCal_RightPanelWindows/wsPopWindow_AddEventWindow.js";
import {wsPage_musicLibrary} from "../../workspaces/ws_musicLibrary/wsPage_musicLibrary.js";
import {wsPage_playlistManager} from "../../workspaces/ws_PlaylistManager/wsPage_playlistManager.js";
import {wsPage_planningCabaret} from "../../workspaces/ws_cabManager/wsPage_planningCabaret.js";
import {wsPage_workPeriods} from "../../workspaces/ws_staffMember/staffMemberPages/wsPage_workPeriods.js";
import {Workspace} from "../../workspaces/navigationArchitecture/class_Workspace.js";


// WORKSPACES INITIALISATION
export const ws_Home = new Workspace(
    {
        defaultPage: wsPage_Home()
    });
export const ws_Calendar = new Workspace(
    {
        wsMenu: wsMenu_Calendar,
        defaultPage: appModuleManager['calendar'].render(),
        //defaultRightPanel: wsPopWindow_AddEvent()//wsPopWindow_AddTimeframe()//
    });

export const ws_musicLibrary = new Workspace(
    {
        defaultPage: wsPage_musicLibrary()
    });

export const ws_Playlists = new Workspace(
    {
        defaultPage: wsPage_playlistManager()
    });

export const ws_Cabaret = new Workspace(
    {
        defaultPage: wsPage_planningCabaret()
    });


export const ws_staffMember = new Workspace(
    {
        wsMenu: wsMenu_staffMember,
        defaultPage: wsPage_workPeriods()
    });
