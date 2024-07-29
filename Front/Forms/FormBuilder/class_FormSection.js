import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";


class FormSection {
    constructor(input) {

        this.id = input.id;
        this.title= input.title;
        this.cssSection = input.cssSection;
        this.cssSectionHeader = input.cssSectionHeader;
        this.cssSectionTitle = input.cssSectionTitle;
        this.cssSectionFieldsContainer = input.cssSectionFieldsContainer;

        this.section = new HTMLelem('div', this.id, this.cssSection);
        this.sectionHeader = new HTMLelem('div', `${this.id}_header`, this.cssSectionHeader);
        this.fieldsContainer = new HTMLelem('div', `${this.id}_container`, this.cssSectionFieldsContainer).render();

        if(input.title) {
            const title = new HTMLelem('span', this.id+'_title', this.cssSectionTitle);
            title.setText(input.title);
            title.isChildOf(this.sectionHeader);
        }

    };

    render() {
        this.section.render().appendChild(this.sectionHeader.render());
        this.section.render().appendChild(this.fieldsContainer);


        return this.section.render();
    }

}

export {FormSection};