import {HTMLelem} from "./HTMLClasses/class_HTMLelem.js";
import {MenuAction} from "./menuClasses/class_MenuAction.js";

class Menu{

    constructor(id= "", cssMenu = "", cssButtons = "") {

        this.cssButtons = cssButtons
        this.menu = new HTMLelem('div', id, cssMenu);
        this.buttonArray = [];

    };

    addButton(id = "", content = "", callBack = () => MenuAction.goHome()) {

        //TODO gérer les types de content text img

        const button = new HTMLelem('button', id, this.cssButtons);
        button.setText(content);

        this.addClickAction(button, callBack);

        this.buttonArray.push(button) // servira pour animations???

        return button;

    };

    addClickAction(element, callback) {

        element.render().addEventListener('click', callback)

    };

    render() {

        for (const button of this.buttonArray) {

            button.isChildOf(this.menu);
        }

        return this.menu.render();

    };

}

export {Menu};