import {FormField} from "./class_FormField.js";


class FormField_Date extends FormField{
    constructor(input){
        super(input);
        this.field.setAttributes({
            'type': 'date',
            'name': this.id,
        });
        this.manageDefaultValue();
    };
    manageDefaultValue() {
        this.field.setAttributes({'value': this.defaultValue});
    };
}

export {FormField_Date};