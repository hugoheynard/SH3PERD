import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class FormField_NumInput {

    constructor(id = "", css = "", require = false, min = -100, max = 100, step = 1){

        this.id = id;
        this.require = require;
        this.min = min;
        this.max = max;
        this.step = step;

        this.createNumField();

    };

    createNumField() {
        this.numField = new HTMLelem('input', this.id, 'form_textField');

        this.numField.setAttributes({
            'type': 'number',
            'name': this.id,
            'placeholder': this.id,
            'min': this.min,
            'max': this.max,
            'step': this.step
        });

        if(this.require) {
            this.numField.setAttributes({'required': ''});
        }

    };

    render() {
        return this.numField.render();
    };

}

export {FormField_NumInput};