import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class FormField_NumInput {

    constructor(id, require, min, max, baseValue){

        this.id = id;
        this.require = require;
        this.min = min;
        this.max = max;
        this.baseValue = baseValue;
        this.container = new HTMLelem('div', id + '_field').render()

        this.numField();

    };

    numField() {

        const numField = new HTMLelem('input', this.id, 'form_textField');

        numField.setAttributes({
            'type': 'number',
            'name': this.id,
            'min': this.min,
            'max': this.max,
            'placeholder': this.id
        });

        if(this.require) {

            numField.setAttributes({'required': ''});

        }

        this.container.appendChild(numField.render());

    };

    render() {

        return this.container;

    };

}

export {FormField_NumInput};