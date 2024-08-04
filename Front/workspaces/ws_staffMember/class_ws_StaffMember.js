import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {MenuAction} from "../../Classes/menuClasses/class_MenuAction.js";
import {BackEndCall} from "../../Classes/class_BackEndCalls.js";
import {wsMenu_staffMember} from "./wsMenu_staffMember.js";
import {createArtistProfile} from "../../Forms/appForms/artistProfileForms/createArtistProfile.js";
import {wsPage_workPeriods} from "./staffMemberPages/wsPage_workPeriods.js";
import {PageContext} from "../class_pageContext.js";
import {WorspaceBase} from "../class_WorspaceBase.js";


class WS_StaffMember extends WorspaceBase{
    constructor(input) {
        super();

        this.wsMenu = input.wsMenu;
        this.defaultPage = input.defaultPage;
        this.pageContext = new PageContext({defaultPage: this.defaultPage});
        //this.addPopMenu();
    };

    addWsMenu(menu) {
        this.appMenus.appendChild(menu.render());
    };

    addPopMenu() {
        this.popMenu = new HTMLelem('div', 'popMenu');
        this.appMenus.appendChild(this.popMenu.render());
    }

    async staffMemberHome () {
        //createArtistProfile();
        //const musicLibData = await BackEndCall.getMusicLib();
    }

    render() {
        this.addWsMenu(this.wsMenu);
        this.app.appendChild(this.pageContext.render());
        this.app.appendChild(this.appMenus);
        //this.staffMemberHome();

        return this.app;

    }

}

export {WS_StaffMember};