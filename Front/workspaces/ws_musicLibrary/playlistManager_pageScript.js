import {wsMenu_staffMember} from "../ws_staffMember/wsMenu_staffMember.js";
import {menu_appGeneral} from "../../menu_appGeneral.js";
import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {Menu} from "../../Classes/class_Menu.js";
import {MenuAction} from "../../Classes/menuClasses/class_MenuAction.js";
import {WorkSpaceContext} from "../class_workspaceContext.js";
import {WS_MusicLibrary} from "./class_ws_MusicLibrary.js";

import {addTrackProcess} from "../../Forms/appForms/musicRelatedForms/addTrackProcess.js";
import {createArtistProfile} from "../../Forms/appForms/artistProfileForms/createArtistProfile.js";


import {WS_StaffMember} from "../ws_staffMember/class_ws_StaffMember.js";


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


const appPage = new HTMLelem('div', 'appPage').render();
mainContainer.appendChild(appPage)


// ALL BELOW IS THE MUSIC LIB PAGE
const appWorkspace = new WorkSpaceContext()
const ws_staffMember = new WS_StaffMember()
const ws_musicLibrary = new WS_MusicLibrary().render()

appWorkspace.setWorkspace(ws_staffMember)

export{appWorkspace}

//addTrackProcess()



