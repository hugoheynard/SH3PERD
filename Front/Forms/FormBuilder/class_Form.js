import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class Form {
    constructor(id, submitAction, nest = null, multipartFormData = false, css = 'sectionContainer') {

        this.id = id;
        this.css = css;

        this.form = new HTMLelem('form', id, css);

        this.multipartFormData = multipartFormData;

        if (this.multipartFormData) {

            this.form.setAttributes({'enctype': 'multipart/form-data'});

        }

        this.submitAction = submitAction;
        this.sectionList = [];

        this.nest = nest;
        this.formDataJSON = null;
        this.returnedData = null;

        this.formElement = this.form.render();
        this.formElement.addEventListener('submit', (event) => this.handleSubmit(event));

    };


    addSection(id, titleContent = "", css = "") {

        const section = new HTMLelem('div', id, css);

        if(titleContent) {
            const title = new HTMLelem('span', undefined, 'form_sectionTitle');
            title.setText(titleContent);
            title.isChildOf(section);
        }

        this.sectionList.push(section.render());
        this.formElement.appendChild(section.render());
    };

    addFieldToSection(sectionID, field) {

        this.sectionList
            .filter(section => section.id === sectionID)
            .map(section => section.appendChild(field));

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

    add_submitButton(text) {

        const button = new HTMLelem('button', undefined, 'button_submitForm_inPopMenu');
        button.setAttributes({'type': 'submit'});
        button.setText(text);
        button.isChildOf(this.form);

        this.submitButton = button.render();
    };

    hide_submitButton() {

        this.submitButton.style.display = "none";

    };

    show_submitButton() {

        this.submitButton.style.display = "flex";

    };

    render() {

        return this.formElement;

    };

    async handleSubmit(event) {

        event.preventDefault();

        try {

            const formData = new FormData(this.form.render());
            this.formDataJSON = Object.fromEntries(formData.entries());

            if (this.nest) {

                const updatedData = {...await this.nest.stepDataReturned, ...this.formDataJSON}

                //console.log('nestOrigin', this.formDataJSON)
                console.log('nestmerge', updatedData)
                this.returnedData = await this.submitAction(updatedData);
                console.log(this.returnedData)

                if(this.multipartFormData) {

                    await this.submitAction(formData);

                }

                if(this.nest.stepIsTheLast()) {

                    //location.reload()
                    return;
                }

                this.nest.moveToNextStep();
                return;

            }

            this.returnedData = await this.submitAction(this.formDataJSON);

            location.reload();
            return;

        } catch (error) {

            console.error('Form submission error:', error);

        }

    };

}

export {Form};