import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class FieldBuilder_selectField {

    constructor(id = "", css = "'form_textField'", required = false, name, descText, optionsArray = []) {

        this.id = id;
        this.css = css;
        this.name = name;
        this.required = required;
        this.descText = descText;
        this.optionsArray = optionsArray;

        this.createSelect();
        this.addDescOption()
        this.addOptions();
    };

    createSelect() {

        this.select = new HTMLelem("select", this.id, this.css);
        this.select.setAttributes({'name': this.name});

        if(this.required) {
            this.select.setAttributes({'required': ''});
        }

    };

    addOptions() {

        for (const content of this.optionsArray) {

            const option = new HTMLelem("option");
            option.setAttributes({'value': content});
            option.setText(content);

            option.isChildOf(this.select);

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

        option.isChildOf(this.select);

    };

    render () {

        return this.select.render();

    };

}

export {FieldBuilder_selectField};