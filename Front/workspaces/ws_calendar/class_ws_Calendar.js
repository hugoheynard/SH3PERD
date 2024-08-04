import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {Menu} from "../../Classes/class_Menu.js";

import {ViewContext} from "./planningClasses/class_ViewContext.js";
import {testDay} from "../../../BackEnd/Classes/class_Day.js";
import {artistMockupDB} from "../../../db/fakeDB.js";

class WS_Calendar {

    constructor() {

        this.app = document.getElementById('appPage');
        this.appElements = new HTMLelem('div', 'appElements').render();
        this.appMenus = new HTMLelem('div', 'appMenus').render();

    }


    addPopMenu() {
        this.popMenu = new HTMLelem('div', 'popMenu');
        this.appMenus.appendChild(this.popMenu.render());
    }

    //async getCalendar() {

    addCalendars() {

        this.appElements.appendChild(new HTMLelem('div', "calHeaderMatrix").render())
        this.appElements.appendChild(new HTMLelem('div', "calendars").render())
        const viewContext = new ViewContext(testDay[0].timeTable, artistMockupDB);
    }

    render() {

        this.addPopMenu();
        //this.addWsMenu();
        this.app.appendChild(this.appElements);
        this.app.appendChild(this.appMenus);

        this.addCalendars()

        return this.app;

    };

}

export {WS_Calendar};