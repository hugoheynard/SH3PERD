import {HTMLelem} from "./frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {WorkSpaceContext} from "./workspaces/class_workspaceContext.js";
import {menu_appGeneral} from "./menu_appGeneral.js";
import {wsMenu_staffMember} from "./workspaces/ws_staffMember/wsMenu_staffMember.js";
import {wsPage_workPeriods} from "./workspaces/ws_staffMember/staffMemberPages/wsPage_workPeriods.js";
import {wsPage_musicLibrary} from "./workspaces/ws_musicLibrary/wsPage_musicLibrary.js";
import {Workspace} from "./workspaces/class_Worspace.js";
import {wsPage_Calendar} from "./workspaces/ws_calendar/wsPage_Calendar.js";
import {wsPage_Home} from "./workspaces/ws_Home/wsPage_Home.js";
import {wsPage_playlistManager} from "./workspaces/ws_PlaylistManager/wsPage_playlistManager.js";
import {wsPage_planningCabaret} from "./workspaces/ws_cabManager/wsPage_planningCabaret.js";
import {wsMenu_Calendar} from "./workspaces/ws_calendar/wsMenu_Calendar.js";
import {wsPopMenu_CalendarHome} from "./workspaces/ws_calendar/PopMenus_Calendar/wsPopMenu_CalendarHome.js";


const body = document.querySelectorAll('body')[0];

//insert the App left menu
body.appendChild(menu_appGeneral.render());

const mainContainer = new HTMLelem('div', 'mainContainer').render();
body.appendChild(mainContainer);


//topMenu
const topMenu = new HTMLelem('div', 'topMenu').render();
topMenu.appendChild(new HTMLelem('div').render());
const meIcon = new HTMLelem('span', 'iconMe').render();
meIcon.textContent = 'H';
topMenu.appendChild(meIcon);
mainContainer.appendChild(topMenu);



// WORKSPACES INITIALISATION
const ws_Home = new Workspace(
    {
        defaultPage: wsPage_Home()
    });
const ws_Calendar = new Workspace(
    {
        wsMenu: wsMenu_Calendar,
        defaultPage: wsPage_Calendar(),
        defaultPopWindow: wsPopMenu_CalendarHome()
    });

const ws_musicLibrary = new Workspace(
    {
        defaultPage: wsPage_musicLibrary()
    });

const ws_Playlists = new Workspace(
    {
        defaultPage: wsPage_playlistManager()
    });

const ws_Cabaret = new Workspace(
    {
        defaultPage: wsPage_planningCabaret()
    });

const ws_staffMember = new Workspace(
    {
        wsMenu: wsMenu_staffMember,
        defaultPage: wsPage_workPeriods()
    });

const appWorkspace = new WorkSpaceContext(
    {
        defaultWorkspace: ws_Calendar
    });

mainContainer.appendChild(appWorkspace.render());


export {
    appWorkspace,
    ws_Home,
    ws_Calendar,
    ws_musicLibrary,
    ws_Playlists,
    ws_Cabaret,
    ws_staffMember
};