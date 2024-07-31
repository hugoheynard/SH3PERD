import {HTMLelem} from "../HTMLClasses/class_HTMLelem.js";


class Icon {
    constructor(input){

        this._type = 'img';
        this._id = input.id;
        this._css = input.css;
        this._publicURL = input.publicURL;
        this._alt = input.alt;

        this._icon = new HTMLelem(this.type, this.id, this.css);

        this.icon.render().src = this.publicURL
        this.icon.render().alt = this.alt
    };

    get type(){
        return this._type;
    };

    get id() {
        return this._id;
    };

    get css() {
        return this._css;
    };

    get publicURL() {
        return this._publicURL;
    };

    get alt() {
        return this._alt;
    };

    get icon() {
        return this._icon;
    };

    render() {
        return this.icon
    }

}

export {Icon};