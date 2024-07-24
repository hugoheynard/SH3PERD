import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {Menu} from "../../Classes/class_Menu.js";
import {MenuAction} from "../../Classes/menuClasses/class_MenuAction.js";
import {WorkSpaceContext} from "../class_workspaceContext.js";
import {WS_MusicLibrary} from "./class_ws_MusicLibrary.js";

import {addTrackProcess} from "../../Forms/FormBuilder/addTrackProcess.js";

const body = document.querySelectorAll('body')[0];

//insert the App left menu
const Menu_appGeneral = new Menu('leftPermanentMenu', undefined, 'button_lpm material-symbols-outlined')
Menu_appGeneral.addButton('button_home', 'home_app_logo', () => MenuAction.goHome());
Menu_appGeneral.addButton('button_calendar', 'calendar_month', () => MenuAction.goCalendar());
Menu_appGeneral.addButton('button_musicLib', 'music_note', () => MenuAction.goMusicLibrary());
Menu_appGeneral.addButton('button_playlistManager', 'featured_play_list', () => MenuAction.goPlaylistManager());
Menu_appGeneral.addButton('button_cabaretManager', 'theater_comedy', () => MenuAction.goCabaretManager());
Menu_appGeneral.addButton('button_logOut', 'logout', () => MenuAction.logOut());
body.appendChild(Menu_appGeneral.render());

const mainContainer = new HTMLelem('div', 'mainContainer').render();
body.appendChild(mainContainer);

//TODO : le retour du login donne la strategy pour le unlock des workspace du menu

//topMenu
const topMenu = new HTMLelem('div', 'topMenu').render();
topMenu.appendChild(new HTMLelem('div').render());
const meIcon = new HTMLelem('span', 'iconMe').render();
meIcon.textContent = 'H';
topMenu.appendChild(meIcon);
mainContainer.appendChild(topMenu);


const appPage = new HTMLelem('div', 'appPage').render();
mainContainer.appendChild(appPage)


// ALL BELOW IS THE MUSIC LIB PAGE //TODO: base workspace
const appWorkspace = new WorkSpaceContext(new WS_MusicLibrary().render())

addTrackProcess()



