import {ws_Calendar} from "./frontElements/init/init_appWorkspaces.js";
import {HTMLelem} from "./frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {menu_appGeneral} from "./menu_appGeneral.js";
import {WorkSpaceContext} from "./workspaces/class_WorkspaceContext.js";
import {Settings_BackendCall} from "./backendCalls/class_Settings_BackendCall.js";





export const appWorkspace = new WorkSpaceContext(
    {
        defaultWorkspace: ws_Calendar
    });

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

mainContainer.appendChild(appWorkspace.render());

