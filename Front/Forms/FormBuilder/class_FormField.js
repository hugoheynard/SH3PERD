import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class FormField {

    constructor (id= "", css= "", require = false) {

        this._id = id;
        this._css = css;
        this._require = require;
        this._type = 'input';

        this._field = this.buildField();

        if(this.require) {
            this.field.setAttributes({'required': ''});
        }
    }

    get id() {
        return this._id;
    };

    get css() {
        return this._css;
    };

    get require() {
        return this._require;
    };

    get type() {
        return this._type;
    };

    set type(value) {
        this._type = value;
    };

    get field() {
        return this._field;
    };

    set field(value) {
        this._field = value;
    }

    buildField() {
        return new HTMLelem(this.type, this.id, this.css)
    };

    addDynamicField(condition, FormFieldInstance) {

        const sourceNode = this.field.render();

        sourceNode.addEventListener('input', (event) => {

            if (condition) {

                sourceNode.parentNode.insertBefore(FormFieldInstance, sourceNode.nextSibling);

            }

        });

    };

    render() {

        return this.field.render();

    };
}

export {FormField};