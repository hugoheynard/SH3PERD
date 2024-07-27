class FormTreeManipulation {
    constructor(formTree) {

        this.formTree = formTree;

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


    addSectionToTree(id, section, sectionHeader, sectionFieldsContainer) {

        return {
            ...this.formTree,
            ...{
                [id]:{
                    'sectionRender':section,
                    'sectionHeader':sectionHeader,
                    'sectionFieldsContainer':sectionFieldsContainer,
                    'fields':{}
                }
            }
        };

    }

    addFieldToTreeSection(sectionID, field) {

        return {
            ...this.formTree[sectionID].fields,
            ...{
                [field.getAttribute('id')]: field
            }
        };

    };

    removeFieldFromCurrentPlace(fieldID) {

        const nodeToRemove = new FormTreeManipulation(this.formTree).getField(fieldID);
        const nodeCurrentSection = new FormTreeManipulation(this.formTree).getSectionOfField(fieldID);

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
}

export {FormTreeManipulation};