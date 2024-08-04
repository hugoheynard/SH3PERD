import {HTMLelem} from "../Classes/HTMLClasses/class_HTMLelem.js";


class PageContext {
    constructor(input) {
        this.defaultPage = input.defaultPage;
        this.page = new HTMLelem('div', 'appElements').render();
        this.currentPage = this.defaultPage;
    };

    undisplayPreviousPage() {
        this.page.innerHTML = '';
    };

    setPage(newFunctionalityPage) {
        this.undisplayPreviousPage();
        this.currentPage = newFunctionalityPage;
        this.page.appendChild(this.currentPage);
    };

    async render() {
        this.page.appendChild(await this.currentPage);
        return this.page;
    };

}

export {PageContext};