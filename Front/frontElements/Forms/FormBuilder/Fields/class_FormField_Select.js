import {HTMLelem} from "../../../Classes/HTMLClasses/class_HTMLelem.js";
import {FormField} from "./class_FormField.js";

class FormField_selectField extends FormField{

    constructor(input) {
        super(input);

        this._type = 'select';
        this._field = this.buildField();

        this._name = this.id;
        this._optionsArray = [];
        this._descText = input.descText ?? input.id;

        this.field.setAttributes({'name': this.name});
        this.addDescOption();
        this.addOptions(input.optionsArray ?? ['emptySelection']);
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

    manageDefaultValue(newValue) {
        super.manageDefaultValue(newValue);

        for (const option of this.optionsArray) {

            if (option.getAttribute('selected') === "true") {
                option.removeAttribute('selected');
            }

            if (option.getAttribute('value') === this.defaultValue) {
                option.setAttribute('selected', true);
            }
        }
        this.field.render().dispatchEvent(new Event('input'));
    };

    addOptions(array) {
        for (const content of array) {

            const option = new HTMLelem("option");
            option.setAttributes({'value': content});
            option.setText(content);

            option.isChildOf(this.field);
            this.optionsArray.push(option.render());
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

        this.optionsArray.push(option.render());

    };

}

export {FormField_selectField};