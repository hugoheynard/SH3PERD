import {FormField} from "./class_FormField.js";
import {DateMethod} from "../../../../../backend/Utilities/class_DateMethods.js";


class FormField_Time extends FormField{
    constructor(input){
        super(input);
        this.field.setAttributes({
            'type': 'time',
            'name': this.id,
            'value': `${new Date(Date.now()).getHours()}:${DateMethod.roundedTime(new Date(Date.now()).getMinutes(), 5)}`
        });
    };
}

export {FormField_Time};