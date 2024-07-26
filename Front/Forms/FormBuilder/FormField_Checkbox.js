import {FormField} from "./class_FormField.js";
import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class FormField_Checkbox extends FormField{

    constructor(id, css, require, label = id, cssLabel){

        super(id, css, require)

        this._label = label;
        this.cssLabel = cssLabel;

        this.field.setAttributes({
            'type': 'checkbox',
            'name': this.id,
        });

        this.container = new HTMLelem('div', "", '').render();
        this.addLabel();
        this.container.appendChild(this.field.render());

    };


    get label() {
        return this._label;
    };

    addLabel() {
        // Create a label element
        const label = new HTMLelem('label', undefined, this.cssLabel);
        label.setAttributes({'for': this.id});
        label.setText(this.label);
        //TODO :
        // Insert the label before the checkbox in the DOM
        this.container.appendChild(label.render());
    };

    render() {

        return this.container;
    };

}

export {FormField_Checkbox};