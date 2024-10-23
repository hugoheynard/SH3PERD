import {HTMLelem} from "./HTMLClasses/class_HTMLelem.js";
import {MenuButton} from "./MenuButton.js";


export class Menu{

    constructor(id= "", cssMenu = "", cssButtons = "") {
        this.cssButtons = cssButtons

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

    addButton(input) {
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

    render() {
        return this.menu.render();
    };

}