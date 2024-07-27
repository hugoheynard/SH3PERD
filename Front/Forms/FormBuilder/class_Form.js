import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {FormTreeManipulation} from "./class_FormTreeManipulation.js";
import {FormDisplayAction} from "./class_FormDisplayAction.js";

class Form {
    constructor(id, submitAction, nest = null, multipartFormData = false, css = 'form col', refreshAction = null) {

        this.id = id;
        this.css = css;

        this.form = new HTMLelem('form', id, css);


        this.multipartFormData = multipartFormData;

        if (this.multipartFormData) {
            this.form.setAttributes({'enctype': 'multipart/form-data'});
        }

        this.submitAction = submitAction;

        this.formTree = {};

        this.nest = nest;
        this.formDataJSON = null;
        this.returnedData = null;

        this.formElement = this.form.render();
        this.formElement.addEventListener('submit', (event) => this.handleSubmit(event));



    };
    async handleSubmit(event) {

        event.preventDefault();

        try {

            const formData = new FormData(this.form.render());
            this.formDataJSON = Object.fromEntries(formData.entries());

            if (this.nest) {

                const updatedData = {...await this.nest.stepDataReturned, ...this.formDataJSON}

                this.returnedData = await this.submitAction(updatedData);

                if(this.multipartFormData) {

                    await this.submitAction(formData);

                }

                if(this.nest.stepIsTheLast()) {

                    //location.reload()
                    return;
                }

                this.nest.moveToNextStep();
                //location.reload()
                return;

            }

            this.returnedData = await this.submitAction(this.formDataJSON);

            location.reload();
            return;

        } catch (error) {

            console.error('Form submission error:', error);

        }

    };

    addSection(id, titleContent = '', cssSection = '', cssSecHeader = '', cssSecTitle = '', cssSecFieldContainer = '') {

        //creates section elements
        const section = new HTMLelem('div', id, cssSection)
        const sectionHeader = new HTMLelem('div', `${id}_header`, cssSecHeader);
        const sectionFields = new HTMLelem('div', `${id}_container`, cssSecFieldContainer);


        if(titleContent) {
            const title = new HTMLelem('span', id+'_title', cssSecTitle);
            title.setText(titleContent);
            title.isChildOf(sectionHeader);
        }

        this.formTree = new FormTreeManipulation(this.formTree).addSectionToTree(id, section, sectionHeader, sectionFields);



    };

    addFieldToSection(sectionID, field) {

        this.formTree[sectionID].fields = new FormTreeManipulation(this.formTree)
            .addFieldToTreeSection(sectionID, field);

    };

    addHiddenField(name, value) {

        const hiddenField = new HTMLelem('input');

        hiddenField.setAttributes({
            'type': 'hidden',
            'name': name,
            'value': value
        });

        this.form.render().appendChild(hiddenField.render());
    };

    add_submitButton(text, id= '', css = '') {

        const button = new HTMLelem('button', id, css);
        button.setAttributes({'type': 'submit'});
        button.setText(text);
        button.isChildOf(this.form);

        this.submitButton = button.render();
    };



    //DISPLAY DESIGN METHODS

    render() {
        return new FormDisplayAction(this).renderForm();
    };

}

export {Form};