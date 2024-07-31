import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {MenuAction} from "../../Classes/menuClasses/class_MenuAction.js";
import {BackEndCall} from "../../Classes/class_BackEndCalls.js";
import {wsMenu_staffMember} from "./wsMenu_staffMember.js";
import {createArtistProfile} from "../../Forms/appForms/artistProfileForms/createArtistProfile.js";


class WS_StaffMember {

    constructor() {
        this.app = document.getElementById('appPage');
        this.appElements = new HTMLelem('div', 'appElements').render();
        this.appMenus = new HTMLelem('div', 'appMenus').render();
        this.wsMenu = wsMenu_staffMember;

        //this.addPopMenu();
        this.addWsMenu(this.wsMenu);
    }

    addWsMenu(menu) {
        this.appMenus.appendChild(menu.render());
    };

    addPopMenu() {
        this.popMenu = new HTMLelem('div', 'popMenu');
        this.appMenus.appendChild(this.popMenu.render());
    }

    async staffMemberHome () {

        const musicGrid = new HTMLelem('div', 'musicGrid').render();
        this.appElements.appendChild(musicGrid);

        //createArtistProfile();
        workPeriods()

        //const musicLibData = await BackEndCall.getMusicLib();

    }

    render() {

        this.app.appendChild(this.appElements);
        this.app.appendChild(this.appMenus);
        this.staffMemberHome();

        return this.app;

    }

}

export {WS_StaffMember};