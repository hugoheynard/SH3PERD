import {FormField} from "./class_FormField.js";
import {DateMethod} from "../../../../../BackEnd/Utilities/class_DateMethods.js";


class FormField_Date extends FormField{
    constructor(input){
        super(input);
        this.field.setAttributes({
            'type': 'date',
            'name': this.id,
            'value': DateMethod.today
        });
    };
}

export {FormField_Date};