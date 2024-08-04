import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {WorkSpaceContext} from "../class_workspaceContext.js";
import {menu_appGeneral} from "../../menu_appGeneral.js";
import {wsMenu_staffMember} from "../ws_staffMember/wsMenu_staffMember.js";
import {WS_Calendar} from "../ws_calendar/class_ws_Calendar.js";
import {wsPage_workPeriods} from "../ws_staffMember/staffMemberPages/wsPage_workPeriods.js";
import {wsPage_musicLibrary} from "./wsPage_musicLibrary.js";
import {Workspace} from "../class_WorspaceBase.js";



const body = document.querySelectorAll('body')[0];

//insert the App left menu
body.appendChild(menu_appGeneral.render());

const mainContainer = new HTMLelem('div', 'mainContainer').render();
body.appendChild(mainContainer);

//TODO : le retour du login donne la strategy pour le unlock des workspace du menu

//topMenu
const topMenu = new HTMLelem('div', 'topMenu').render();
topMenu.appendChild(new HTMLelem('div').render()); // pour les autres trucs
const meIcon = new HTMLelem('span', 'iconMe').render();
meIcon.textContent = 'H';
topMenu.appendChild(meIcon);
mainContainer.appendChild(topMenu);



// ALL BELOW IS THE INITIALISATION

const ws_Calendar = new WS_Calendar();
const ws_musicLibrary = new Workspace(
    {
        defaultPage: wsPage_musicLibrary()
    });
const ws_staffMember = new Workspace(
    {
        wsMenu: wsMenu_staffMember,
        defaultPage: wsPage_workPeriods()
    });

const appWorkspace = new WorkSpaceContext(
    {
        defaultWorkspace: ws_staffMember
    });
mainContainer.appendChild(appWorkspace.render())


export {
    appWorkspace,
    ws_Calendar,
    ws_musicLibrary,
    ws_staffMember
}





