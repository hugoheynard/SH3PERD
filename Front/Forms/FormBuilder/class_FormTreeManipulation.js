class FormAction {
    constructor(formTree) {

        this.formTree = formTree;

    };

    //FORM TREE MANIPULATIONS METHODS
    getField(fieldID) {
        for (const section in this.formTree) {

            if(this.formTree[section].fields.hasOwnProperty(fieldID)) {
                return this.formTree[section].fields[fieldID];
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

    getSectionIDFromFieldID(fieldID) {

        for (const section in this.formTree) {

            if(this.formTree[section].fields.hasOwnProperty(fieldID)) {
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

        const dynamicField = input.FormFieldInstance
        const triggerList = input.triggers;

        const stepValidationList = [];
        const allStepValid = () => stepValidationList.every(trigger => trigger);

        for (const triggerField of triggerList) {

            const triggerID = Object.keys(triggerField)[0];
            const condition = Object.values(triggerField)[0];

            this.getField(triggerID).addEventListener('input', (event) => {

                if(condition(event)) {
                    stepValidationList.push(true);
                }

                //listen to the number of true condition, //TODO: could be writen obj{trigName: boolean}
                if(stepValidationList.length === triggerList.length){

                    if(allStepValid()) { //TODO: truthy mais clair en lecture?
                        //perform action
                        this.formTree = this.addFieldToTreeSection(this.getSectionIDFromFieldID(triggerID), dynamicField);
                        //this.insertElementAfter(input.previousElement, currentNodeID);
                        return;
                    }
                    //TODO: dans l'idée c'est pas mal pour la scalabilité des triggers
                    // mais il va falloir voir pour le timing
                    // ça update le tree local mais pas celui d'origine? va falloir rabattre la donnée
                }

                if(document.getElementById(this.getSectionIDFromFieldID(triggerID)).contains(input.FormFieldInstance)) {

                    if (!allStepValid()) {
                        //this.removeFieldFromCurrentPlace(currentNodeID);
                    }
                }
            });
        }
    };
}

export {FormAction};