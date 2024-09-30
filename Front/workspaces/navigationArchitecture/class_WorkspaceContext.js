import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


class WorkSpaceContext{

    constructor(input) {
        this.app = new HTMLelem('div', 'appPage').render();
        this.appElements = new HTMLelem('div', 'appElements').render();
        this.appMenus = new HTMLelem('div', 'appMenus').render();
        this.workSpaceStrategy  = input.defaultWorkspace;
        this.setWorkspace(this.workSpaceStrategy);
    };

    eraseCurrentWorkspace() {
        this.app.innerHTML = '';
    };

    setWorkspace(newWorkSpace) {
        this.eraseCurrentWorkspace();
        newWorkSpace.app = this.app
        this.workSpaceStrategy = newWorkSpace;
        this.workSpaceStrategy.render();
    };

    render() {
        return this.app;
    };

}

export {WorkSpaceContext};