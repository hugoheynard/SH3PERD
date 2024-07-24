import {FormField} from "./class_FormField.js";

class FormField_NumInput extends FormField{

    constructor(id, css, require, min = -100, max = 100, step = 1){
        super(id, css, require)

        this._min = min;
        this._max = max;
        this._step = step;

        this.field.setAttributes({
            'type': 'number',
            'name': this.id,
            'placeholder': this.id,
            'min': this._min,
            'max': this._max,
            'step': this._step
        });

    };

    get min() {
        return this._min;
    };

    get max() {
        return this._max;
    };

    get step() {
        return this._step;
    };

}

export {FormField_NumInput};