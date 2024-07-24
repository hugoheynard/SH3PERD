import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class FormField_textInput {

    constructor(id = "", require = false, placeholderContent = id, css = 'form_textField'){

        this.id = id;
        this.require = require;
        this.placeholderContent = placeholderContent;

        this.field = new HTMLelem('input', this.id, css);

        this.field.setAttributes({
            'type': 'text',
            'name': this.id,
            'placeholder': this.placeholderContent
        });

        if(this.require) {
            this.field.setAttributes({'require': ''})
        }

    };

    render() {

        return this.field.render();

    };

}

export {FormField_textInput};