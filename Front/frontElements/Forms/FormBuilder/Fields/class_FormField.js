import {HTMLelem} from "../../../Classes/HTMLClasses/class_HTMLelem.js";


class FormField {

    constructor (input) {

        this._id = input.id;
        this._css = input.css;
        this._require = input.require ?? false;
        this._type = 'input';

        this.field = this.buildField();

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

    render() {

        return this.field.render();

    };
}

export {FormField};