import {HTMLelem} from "../frontElements/Classes/HTMLClasses/class_HTMLelem.js";

class PopMenuContext {
    constructor(input) {
        this.defaultPopWindow = input.defaultPopWindow;
        this.currentPopWindow = this.defaultPopWindow;
        this.popMenu = new HTMLelem('div', 'popMenu').render();
    };

    undisplayPreviousPopMenu() {
        this.popMenu.innerHTML = '';
    };

    async setPopMenu(newFunctionalityPage) {
        this.undisplayPreviousPopMenu();
        this.currentPopWindow = await newFunctionalityPage;
        this.popMenu.appendChild(this.currentPopWindow);
    };

    async render() {
        this.popMenu.appendChild(await this.currentPopWindow);
        return this.popMenu;
    };
}

export {PopMenuContext};