import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {FormSection} from "./class_FormSection.js";


class Form {
    constructor(input) {

        this.id = input.id;
        this.css = input.css ?? 'form col';
        this.multipartFormData = input.multipartFormData ?? false;
        this.submitAction = input.submitAction;
        this.refreshAction = input.refreshAction;
        this.nest = input.nest;

        this.form = new HTMLelem('form', this.id, this.css);

        if (this.multipartFormData) {
            this.form.setAttributes({'enctype': 'multipart/form-data'});
        }

        this.formTree = {};

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
            console.log(this.formDataJSON)
            if (this.nest) {
                const updatedData = {...await this.nest.stepDataReturned, ...this.formDataJSON}

                this.returnedData = await this.submitAction(updatedData);

                if (this.multipartFormData) {
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
            positionInForm: input.positionInForm ?? this.defaultSectionPosition(),
                element: new FormSection({id: input.id, ...input.element})
        }
    };

    defaultSectionPosition() {
        // the number of sections in tree
        return Object.values(this.formTree).filter(obj => obj.type === 'section').length;
    };

    addField(input) {
        if (this.elemExistsInTree(input.element.id)) {
            throw new Error(`Field "${input.element.id}" already exists in form`);
        }

        this.formTree[input.element.id] = {
            type:"field",
            section: input.section,
            isDynamic: input.isDynamic,
            element: input.element
        };
    };

    //Dynamic Fields
    addDynamicField(input) {
        for (const triggerField of input.triggerList.triggerList) {
            this.getElement(triggerField.id).element.render()
                .addEventListener('input', (event) => {
                    this.triggerFieldValidationState(triggerField, event);

                    if (!input.triggerList.isValid()) {
                        this.removeDynamicField(input.dynamicField);
                        return;
                    }

                    const defaultPreviousElement = input.triggerList.triggerList.at(-1).id;
                    this.dynamicFieldRender(
                        this.getElement(input.dynamicField).element,
                        input.previousElement ?? defaultPreviousElement
                    );
                });
        }
    };
    dynamicFieldRender(field, previousElement) {
        document.getElementById(previousElement).insertAdjacentElement('afterend', field.render());
    };
    removeDynamicField(field) {
        const fieldToRemove = document.getElementById(field);

        if (fieldToRemove) {
            fieldToRemove.remove();
        }
    };
    triggerFieldValidationState(triggerField, event) {
        if (triggerField.condition(event)) {
            triggerField.validationState = true;
            return;
        }
        triggerField.validationState = false;
    };

    getElement(elem_id) {
        if (!this.formTree.hasOwnProperty(elem_id)) {
            throw new Error(`element "${elem_id}" doesn't exist in form`);
        }
        return this.formTree[elem_id];
    };

    getFieldContainer(section_id) {
        return this.getElement(section_id).element.fieldsContainer;
    };

    addHiddenField(input) {
        const hiddenField = new HTMLelem('input');

        hiddenField.setAttributes({
            'type': 'hidden',
            'name': input.name,
            'value': input.value
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
    hide_submitButton() {
        if (!this.submitButton) {
            throw new Error('This form doesnt have a submit button');
        }

        this.formElement.removeChild(this.submitButton);
        return;
    };

    show_submitButton() {
        if(!this.submitButton){
            throw new Error('This form doesnt have a submit button');
        }

        this.formElement.appendChild(this.submitButton);
        return;
    };



    //RENDER METHODS
    appendSections() {
        Object.values(this.formTree)
            .filter(elem => elem.type === 'section')
            .sort((a, b) => a.positionInForm - b.positionInForm)
            .map(section => this.formElement.appendChild(section.element.section));
    };

    appendFields() {
        Object.values(this.formTree)
            .filter(elem => elem.type === 'field')
            .sort((a, b) => a.positionInSection - b.positionInSection)
            .map(field => {

                if (!field.isDynamic) {
                    this.getFieldContainer(field.section).appendChild(field.element.render())
                }
            });
    };

    render() {
        if (!this.submitButton) {
            throw new Error('Submit button is missing, use method "add_submitButton"')
        }

        this.appendSections();
        this.appendFields();

        this.formElement.appendChild(this.submitButton)

        return this.formElement;
    };

}

export {Form};