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

    addSectionToTree(id, sectionFields) {

        return {
            ...this.formTree,
            ...{
                [id]:{
                    'sectionRender':sectionFields.render(),
                    'fields':{}
                }
            }
        };

    }

    addFieldToTreeSection(sectionID, field) {

        const fieldID = field.getAttribute('id');

        //completes the formTree
        this.formTree[sectionID].fields = {
            ...this.formTree[sectionID].fields,
            ...{
                [fieldID]: field
            }
        };

    };

}

export {FormTreeManipulation};