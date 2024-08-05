import {HTMLelem} from "../frontElements/Classes/HTMLClasses/class_HTMLelem.js";

class PopMenuContext {
    constructor(input) {
        this.defaultPage = input.defaultPage;
        this.currentPage = this.defaultPage;
        this.popMenu = new HTMLelem('div', 'popMenu').render();
    };

    undisplayPreviousPopMenu() {
        this.popMenu.innerHTML = '';
    };

    async setPage(newFunctionalityPage) {
        this.undisplayPreviousPopMenu();
        this.currentPage = await newFunctionalityPage;
        this.popMenu.appendChild(this.currentPage);
    };

    async render() {
        this.popMenu.appendChild(await this.currentPage);
        return this.popMenu;
    };
}

export {PopMenuContext};