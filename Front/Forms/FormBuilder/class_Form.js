import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";


class Form {
    constructor(id, submitAction, nest = null, multipartFormData = false, css = 'form col', refreshAction = null) {

        this.id = id;
        this.css = css;
        this.form = new HTMLelem('form', this.id, this.css);

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

    elemExistsInTree(elem) {
        return this.formTree.hasOwnProperty(elem);
    };

    addSection(input) {

        if (this.elemExistsInTree(input.id)) {
            throw new Error(`Section "${input.id}" already exists in form`);
        }

        this.formTree[input.id] = {
            type:'section',
            positionInForm:input.positionInForm, //TODO: voir pour ajouter un default
            element: input.element
        }
    };

    addField(input) {

        if (this.elemExistsInTree(input.element.id)) {
            throw new Error(`Field "${input.element.id}" already exists in form`);
        }

        this.formTree[input.element.id] = {
            type:"field",
            section: input.section,
            element: input.element
        };
    };

    addDynamicField(input) {
        for (const triggerField of input.triggerList.triggerList) {
            this.getElement(triggerField.id).element.render()
                .addEventListener('input', (event) => {

                    if (triggerField.condition(event)) {
                        triggerField.validationState = true;
                    }

                    if (input.triggerList.isValid()) {

                        const defaultPreviousElement = input.triggerList.triggerList.at(-1).id;
                        const defaultSection = this.getElement(input.triggerList.triggerList.at(-1).id).section;

                        this.addField(
                            {
                                section: input.destinationSection ?? defaultSection,
                                element: input.dynamicField
                            });


                        this.dynamicFieldRender(
                            input.dynamicField,
                            input.previousElement ?? defaultPreviousElement
                        );
                        return;
                    }

                    if (!input.triggerList.isValid()) {
                        this.removeDynamicField(input.dynamicField);
                    }

                });
        }
    };

    getElement(elem_id) {

        if (!this.formTree.hasOwnProperty(elem_id)) {
            throw new Error(`element "${elem_id}" doesn't exist in form`);
        }

        return this.formTree[elem_id];
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

        this.submitButton = button.render();
    };

    //DISPLAY DESIGN METHODS
    dynamicFieldRender(field, previousElement) {
        document.getElementById(previousElement).insertAdjacentElement('afterend', field.render());
    };

    removeDynamicField(field) {

        const fieldToRemove = document.getElementById(field.id)
        if (fieldToRemove) {
            fieldToRemove.remove()
        }
    };

}

export {Form};