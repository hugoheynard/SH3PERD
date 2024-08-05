import {HTMLelem} from "../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


class PageContext {
    constructor(input) {
        this.defaultPage = input.defaultPage;
        this.currentPage = this.defaultPage;
        this.appElements = new HTMLelem('div', 'appElements').render();
    };

    undisplayPreviousPage() {
        this.appElements.innerHTML = '';
    };

    async setPage(newFunctionalityPage) {
        this.undisplayPreviousPage();
        this.currentPage = await newFunctionalityPage;
        this.appElements.appendChild(this.currentPage);
    };

    async render() {
        this.appElements.appendChild(await this.currentPage);
        return this.appElements;
    };

}

export {PageContext};