import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


export class WorkSpaceContext{

    constructor() {
        this.workspaceContainer = new HTMLelem('div', 'workspaceContainer').render();
        this.appElements = new HTMLelem('div', 'appElements').render();
        this.appMenus = new HTMLelem('div', 'appMenus').render();
    };

    eraseCurrentWorkspace() {
        this.workspaceContainer.innerHTML = '';
    };

    setWorkspace(newWorkSpace) {
        this.eraseCurrentWorkspace();
        newWorkSpace.workspaceContainer = this.workspaceContainer
        this.workSpaceStrategy = newWorkSpace;
        this.workSpaceStrategy.render();
    };

    render() {
        return this.workspaceContainer;
    };
}