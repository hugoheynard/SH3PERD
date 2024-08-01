import {HTMLelem} from "../Classes/HTMLClasses/class_HTMLelem.js";


class WorkSpaceContext{

    constructor() {

        this.app = document.getElementById('appPage');
        //this.workSpaceStrategy = workSpaceStrategy;

    }

    eraseCurrentWorkspace() {

        //const appPage = document.getElementById('appPage');

        this.app.innerHTML = "";

    };

    setWorkspace(newWorkSpace) {

        this.eraseCurrentWorkspace();
        newWorkSpace.app = this.app
        newWorkSpace.appElements = new HTMLelem('div', 'appElements').render();
        newWorkSpace.appMenus = new HTMLelem('div', 'appMenus').render();
        this.workSpaceStrategy = newWorkSpace.render();

    };

}

export {WorkSpaceContext};