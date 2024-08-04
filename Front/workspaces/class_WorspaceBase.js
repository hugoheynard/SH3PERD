import {HTMLelem} from "../Classes/HTMLClasses/class_HTMLelem.js";


class WorspaceBase {
    constructor() {
        this._appElements = new HTMLelem('div', 'appElements').render();
        this._appMenus = new HTMLelem('div', 'appMenus').render();
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
}

export {WorspaceBase};