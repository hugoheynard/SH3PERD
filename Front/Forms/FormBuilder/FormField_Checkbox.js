import {FormField} from "./class_FormField.js";
import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class FormField_Checkbox extends FormField{

    constructor(id, cssContainer, require, label = id, cssLabel, customizeCheckbox = false, cssCheckbox){

        super(id, cssContainer, require)

        this._label = label;
        this.cssLabel = cssLabel;
        this.customizeCheckbox = customizeCheckbox
        this.cssCheckbox = cssCheckbox;

        this.field.setAttributes({
            'type': 'checkbox',
            'name': this.id,
            'class': cssCheckbox
        });

        this.container = new HTMLelem('div', "", cssContainer).render();
        this.addLabel();

        if(this.customizeCheckbox) {

            this.addCustomCheckbox();
            this.field.setAttributes({'class':''})
        }

        this.container.appendChild(this.field.render());

    };


    get label() {
        return this._label;
    };

    addCustomCheckbox(){
        const customCheckbox = new HTMLelem('span', '', this.cssCheckbox)
        this.container.appendChild(customCheckbox.render());
    }

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