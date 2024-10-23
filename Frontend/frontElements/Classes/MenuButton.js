import {HTMLelem} from "./HTMLClasses/class_HTMLelem.js";
import {Icon} from "./icones/class_Icon.js";
import {MenuAction} from "./menuClasses/class_MenuAction.js";

class MenuButton {
    constructor(input) {
        this.defaultCallback = MenuAction.goHome

        this.id = input.id ?? '';
        this.content = input.content;
        this.callback = input.callback ?? this.defaultCallback;
        this.css = input.css ?? '';

        this.button = new HTMLelem('button', this.id, this.css);


        if (typeof this.content === 'string') {
            this.button.setText(this.content);
        }

        if (this.content instanceof Icon) {
            this.content.render().isChildOf(this.button);
        }

        this.addClickAction();
    };

    addClickAction() {
        this.button.render().addEventListener('click', this.callback)
    };
}

export {MenuButton};