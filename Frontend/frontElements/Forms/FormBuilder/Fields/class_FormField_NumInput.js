import {FormField} from "./class_FormField.js";

class FormField_NumInput extends FormField{

    constructor(input){
        super(input)

        this._min = input.min;
        this._max = input.max;
        this._step = input.step;

        this.field.setAttributes({
            'type': 'number',
            'name': this.id,
            'placeholder': this.id,
            'min': this.min,
            'max': this.max,
            'step': this.step
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