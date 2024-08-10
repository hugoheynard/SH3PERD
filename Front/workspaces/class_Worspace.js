import {HTMLelem} from "../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {PageContext} from "./class_pageContext.js";
import {PopMenuContext} from "./class_PopContext.js";


class Workspace {
    constructor(input) {
        this._appElements = new HTMLelem('div', 'appElements').render();
        this._appMenus = new HTMLelem('div', 'appMenus').render();

        this.wsMenu = input.wsMenu;
        this.defaultPage = input.defaultPage;
        this.pageContext = new PageContext({defaultPage: this.defaultPage});

        this.defaultPopWindow = input.defaultPopWindow;
        this.popContext = new PopMenuContext({defaultPopWindow: this.defaultPopWindow});

    };

    get appElements() {
        return this._appElements;
    };

    set appElements(value) {
        this._appElements = value;
    };

    get appMenus() {
        return this._appMenus;
    };

    set appMenus(value) {
        this._appMenus = value;
    };

    addWsMenu(menu) {
        this.appMenus.appendChild(menu.render());
    };

    addPopMenu() {
        this.popMenu = new HTMLelem('div', 'popMenu');
        this.appMenus.appendChild(this.popMenu.render());
    };

    async render() {
        if (this.wsMenu) {
            this.addWsMenu(this.wsMenu);
        }

        if (this.defaultPopWindow) {
            //this.appMenus.insertBefore(await this.popContext.render(), this.wsMenu.render());
        }

        this.app.appendChild(await this.pageContext.render());
        this.app.appendChild(this.appMenus);

        return this.app;
    };

}

export {Workspace};