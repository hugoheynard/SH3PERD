import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


export class PageContext {
    constructor() {
        this.html = new HTMLelem('div', 'appElements').render();
    };

    undisplayPreviousPage() {
        this.html.innerHTML = '';
    };

    setPage(newFunctionalityPage) {
        this.undisplayPreviousPage();
        this.currentPage = newFunctionalityPage;
        this.html.appendChild(this.currentPage);
    };
}