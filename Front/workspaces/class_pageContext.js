import {HTMLelem} from "../Classes/HTMLClasses/class_HTMLelem.js";


class PageContext {
    constructor(input) {
        this.defaultPage = input.defaultPage;
        this.page = new HTMLelem('div', 'appElements').render();
        this.currentPage = this.defaultPage;
        this.page.appendChild(this.currentPage);
    };

    undisplayPreviousPage() {
        this.page.innerHTML = '';
    };

    setPage(newFunctionalityPage) {
        this.undisplayPreviousPage();
        this.currentPage = newFunctionalityPage;
        this.page.appendChild(this.currentPage);
    };

    render() {
        return this.page;
    };

}

export {PageContext};