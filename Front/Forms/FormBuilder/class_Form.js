import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class Form {
    constructor(id, submitAction, nest = null, multipartFormData = false, css = 'sectionContainer', refreshAction = null) {

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

    addSection(id, titleContent = "", css = "") {

        //creates section elements
        const section = new HTMLelem('div', id, css);

        if(titleContent) {
            const title = new HTMLelem('span', undefined, 'form_sectionTitle');
            title.setText(titleContent);
            title.isChildOf(section);
        }

        //updates tree
        this.formTree = {
            ...this.formTree,
            ...{
                [id]:{
                    'sectionRender':section.render(),
                    'fields':{}
                }
            }
        };

        this.formElement.appendChild(this.formTree[id].sectionRender);
    };

    addFieldToSection(sectionID, field) {

        const fieldID = field.getAttribute('id');
        const destinationSection = this.formTree[sectionID].sectionRender;

        //completes the formTree
        this.formTree[sectionID].fields = {
            ...this.formTree[sectionID].fields,
            ...{
                [fieldID]: field
            }
        };

        const newField = this.formTree[sectionID].fields[fieldID];

        //appends the field to section
        destinationSection.appendChild(newField);

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

    //FORM TREE MANIPULATIONS METHODS

    getField(field) {

        for (const section in this.formTree) {

            if(this.formTree[section].fields.hasOwnProperty(field)) {
                return this.formTree[section].fields[field];
            }

        }

        return null;
    };

    getSectionOfField(field) {

        for (const section in this.formTree) {

            if(this.formTree[section].fields.hasOwnProperty(field)) {
                return this.formTree[section].sectionRender;
            }

        }

        return null;

    };

    removeFieldFromCurrentPlace(fieldID) {

        const nodeToRemove = this.getField(fieldID);
        const nodeCurrentSection = this.getSectionOfField(fieldID);

        nodeCurrentSection.removeChild(nodeToRemove);

        delete this.formTree[nodeCurrentSection.getAttribute('id')].fields[fieldID];

        return nodeToRemove;

    };

    insertElementAfter(previousElement, fieldID) {
        // Remove the field from its current place
        const currentField = this.removeFieldFromCurrentPlace(fieldID);

        // Get the parent section of the previousElement
        const parentSection = this.getSectionOfField(previousElement);

        if (!parentSection) {
            console.error(`Previous element with ID ${previousElement} not found in any section.`);
            return;
        }

        const parentSectionId = parentSection.getAttribute('id');

        const previousField = this.getField(previousElement);


        // Copy the fields of the section
        const sectionCopy = { ...this.formTree[parentSectionId].fields };
        const insert = {[fieldID]: currentField};

        // Merge the parts with the inserted field
        this.formTree[parentSectionId].fields = {...insert, ...sectionCopy};

        parentSection.insertBefore(currentField, previousField.nextSibling);
    };

    addDynamicField(triggerField, condition, FormFieldInstance, previousElement = triggerField) {

        const sourceNode = this.getField(triggerField);
        const parentNode = this.getSectionOfField(triggerField);
        const currentNodeID = FormFieldInstance.getAttribute('id');

        sourceNode.addEventListener('input', (event) => {

            if(parentNode.contains(FormFieldInstance)) {

                if (!condition(event)) {

                    this.removeFieldFromCurrentPlace(currentNodeID);
                    return;
                }

            }

            if (condition(event)) {

                this.addFieldToSection(parentNode.getAttribute('id'), FormFieldInstance);
                this.insertElementAfter(previousElement, currentNodeID);

            }



        });

    };

    //DISPLAY DESIGN METHODS

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

                this.returnedData = await this.submitAction(updatedData);

                if(this.multipartFormData) {

                    await this.submitAction(formData);

                }

                if(this.nest.stepIsTheLast()) {

                    //location.reload()
                    return;
                }

                this.nest.moveToNextStep();
                location.reload()
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