import {FormField} from "./class_FormField.js";

class FormField_textInput extends FormField{


    constructor(id, css, require, placeholderContent = id){

        super(id, css, require)

        this._placeholderContent = placeholderContent;

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