import {HTMLelem} from "./HTMLClasses/class_HTMLelem.js";
import {MenuAction} from "./menuClasses/class_MenuAction.js";
import {Icon} from "./icones/class_Icon.js";
import {MenuButton} from "./MenuButton.js";

class Menu{

    constructor(id= "", cssMenu = "", cssButtons = "") {
        this.cssButtons = cssButtons
        this.defaultCallback = MenuAction.goHome

        this.menu = new HTMLelem('div', id, cssMenu);
        this.ensemblesArray = [];
        this.buttonArray = [];
    };

    addEnsemble(input) {
        if (this.ensemblesArray.some(ens => ens.id === input.id)) {
            throw new Error('Ensemble already exists in menu');
        }
        const ensemble = {
            id: input.id,
            container: new HTMLelem('div', input.id, input.css),
            buttonArray: []
        }

        this.ensemblesArray.push(ensemble)
        ensemble.container.isChildOf(this.menu)
    };

    addButton(id = "", content, callBack = this.defaultCallback) {
        //TODO gérer les types de content text img
        const button = new HTMLelem('button', id, this.cssButtons);

        if (typeof content === 'string') {
            button.setText(content);
        }

        if (content instanceof Icon) {
            content.render().isChildOf(button);
        }

        this.addClickAction(button, callBack);
        this.buttonArray.push(button) // servira pour animations???

        return button;
    };

    addButton_V2(input) {
        const button = new MenuButton(
            {
                id: input.id,
                content: input.content,
                callback: input.callback,
                css: this.cssButtons
            }
        ).button;

        if (input.ensemble) {
            const ensemble =  this.ensemblesArray.filter(ens => ens.id === input.ensemble)[0];
            ensemble.buttonArray.push(button);
            button.isChildOf(ensemble.container)
            return;
        }
        this.buttonArray.push(button);
        button.isChildOf(this.menu);
    };

    addClickAction(element, callback) {
        element.render().addEventListener('click', callback)
    };

    render() {
        return this.menu.render();
    };

}

export {Menu};