import {HTMLelem} from "../Classes/HTMLClasses/class_HTMLelem.js";


class WorkSpaceContext{

    constructor(workSpaceStrategy) {

        this.app = document.getElementById('appPage');
        this.workSpaceStrategy = workSpaceStrategy;

    }

    eraseCurrentWorkspace() {

        //const appPage = document.getElementById('appPage');

        this.app.innerHTML = "";

    };

    setWorkspace(newWorkSpace) {

        this.eraseCurrentWorkspace();
        this.workSpaceStrategy = newWorkSpace.render();

    };

}

export {WorkSpaceContext};