import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {FormField} from "./class_FormField.js";

class FormField_selectField extends FormField{

    constructor(id, css, required, name, descText = optionsArray[0], optionsArray = ['emptySelection']) {
        super(id, css, required);

        this._type = 'select';
        this._field = this.buildField();

        this._name = name;
        this._descText = descText;
        this._optionsArray = optionsArray;

        this.field.setAttributes({'name': this.name});
        this.addDescOption()
        this.addOptions();
    };

    get name() {
        return this._name;
    };

    get descText() {
        return this._descText;
    };

    get optionsArray() {
        return this._optionsArray;
    };

    addOptions() {

        for (const content of this.optionsArray) {

            const option = new HTMLelem("option");
            option.setAttributes({'value': content});
            option.setText(content);

            option.isChildOf(this.field);

        }

    };

    addDescOption() {

        const option = new HTMLelem("option");

        option.setAttributes({
            'value': "",
            'disabled': "true",
            'selected': "true"
        });

        option.setText(this.descText);

        option.isChildOf(this.field);

    };

}

export {FormField_selectField};