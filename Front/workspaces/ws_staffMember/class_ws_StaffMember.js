import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {MenuAction} from "../../Classes/menuClasses/class_MenuAction.js";
import {BackEndCall} from "../../Classes/class_BackEndCalls.js";
import {wsMenu_staffMember} from "./wsMenu_staffMember.js";
import {createArtistProfile} from "../../Forms/appForms/artistProfileForms/createArtistProfile.js";
import {wsPage_workPeriods} from "./wsPage_workPeriods.js";


class WS_StaffMember {

    constructor() {
        this.wsMenu = wsMenu_staffMember;

        //this.addPopMenu();

    }

    addWsMenu(menu) {
        this.appMenus.appendChild(menu.render());
    };

    addPopMenu() {
        this.popMenu = new HTMLelem('div', 'popMenu');
        this.appMenus.appendChild(this.popMenu.render());
    }

    async staffMemberHome () {


        this.appElements.appendChild(wsPage_workPeriods());

        //createArtistProfile();


        //const musicLibData = await BackEndCall.getMusicLib();

    }

    render() {
        this.addWsMenu(this.wsMenu);
        this.app.appendChild(this.appElements);
        this.app.appendChild(this.appMenus);
        this.staffMemberHome();

        return this.app;

    }

}

export {WS_StaffMember};