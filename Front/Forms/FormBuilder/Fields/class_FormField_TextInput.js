import {FormField} from "./class_FormField.js";


class FormField_textInput extends FormField{

    constructor(input){

        super(input);

        this._placeholderContent = input.placeholderContent ?? input.id;

        this.field.setAttributes({
            'type': 'text',
            'name': this.id,
            'placeholder': this.placeholderContent
        });

    };

    get placeholderContent() {
        return this._placeholderContent;
    };

}

export {FormField_textInput};