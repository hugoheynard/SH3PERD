import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";


class FormSection {

    constructor(input) {
        this._id = input.id;
        this._title= input.title;
        this._style = input.style;

        this.section = new HTMLelem('div', this.id, this.style.global).render();
        this.build();
    };
    get id() {
        return this._id;
    };
    get title() {
        return this._title;
    };
    get style() {
        return this._style;
    };
    build() {
        this.sectionHeader = new HTMLelem('div', `${this.id}_header`, this.style.header);
        this.fieldsContainer = new HTMLelem('div', `${this.id}_container`, this.style.container).render();

        if(this.title) {
            const title = new HTMLelem('span', this.id+'_title', this.style.title);
            title.setText(this.title);
            title.isChildOf(this.sectionHeader);
        }

        this.section.appendChild(this.sectionHeader.render());
        this.section.appendChild(this.fieldsContainer);
    };
}

export {FormSection};