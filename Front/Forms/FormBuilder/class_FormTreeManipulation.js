class FormAction {
    constructor(formTree) {

        this.formTree = formTree;

    };

    //FORM TREE MANIPULATIONS METHODS
    getField(fieldID) {
        for (const section in this.formTree) {

            if (this.formTree[section].fields.hasOwnProperty(fieldID)) {
                return this.formTree[section].fields[fieldID];
            }

        }
        return null;
    };

    getSectionOfField(fieldID) {

        for (const section in this.formTree) {

            if (this.formTree[section].fields.hasOwnProperty(fieldID)) {
                return this.formTree[section].sectionRender;
            }
        }

        return null;

    };

    getSectionIDFromFieldID(fieldID) {

        for (const section in this.formTree) {

            if (this.formTree[section].fields.hasOwnProperty(fieldID)) {
                return this.formTree[section].sectionRender.id;
            }
        }

        return null;

    };

    addSectionToTree(input) {
        return {
            ...this.formTree,
            ...{
                [input.sectionId]:{
                    'sectionRender':input.section,
                    'sectionHeader':input.sectionHeader,
                    'sectionFieldsContainer':input.sectionFieldsContainer,
                    'fields':{}
                }
            }
        };
    };

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

    addDynamicField(input) {
        for (const triggerField of input.triggerList.triggerList) {
            this.getField(triggerField.id).addEventListener('input', (event) => {

                if (triggerField.condition(event)) {
                    triggerField.validationState = true;
                }

                if (input.triggerList.isValid()) {
                    //perform action
                    console.log('yeah')
                    //this.formTree = this.addFieldToTreeSection(this.getSectionIDFromFieldID(triggerID), input.dynamicField);
                    //this.insertElementAfter(input.previousElement, currentNodeID);
                    return;
                }
                    // ça update le tree local mais pas celui d'origine? va falloir rabattre la donnée

                if (document.getElementById(this.getSectionIDFromFieldID(triggerField.id)).contains(input.dynamicField)) {

                    if (!input.triggerList.isValid()) {
                        //this.removeFieldFromCurrentPlace(currentNodeID);
                    }
                }
            });
        }
    };
}

export {FormAction};